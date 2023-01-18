import { Request } from 'express';
import util from 'util';
import { EVENTS_DESKTOP, EVENTS_MOBILE, EVENTS_UNUSED_BOTS } from '@constants/event';
// Core
import { ForbiddenException } from '@core/exceptions';
// Constants
import {
  AVG_CAPTCHA_RES_TIME,
  AVG_CAPTCHA_RETRIES,
  EVENTS_STATS,
  HUMAN_SCORE,
  MINIMUM_AVERAGE_EVENT_INTERVAL,
  MINIMUM_AVERAGE_EVENT_INTERVAL_IN_S,
  MINIMUM_EVENT_INTERVAL,
  MIN_HUMAN_SCORE,
  REQUETS_PER_MIN,
  SCORE
} from '@constants/analytics';
// Repositories
import EvaluationRepository from '@repositories/evaluation.repository';
import BlacklistedIpRepository from '@repositories/black-listed-ip.repository';
// Utils
import { allowedBots, mobileBrowserOs, browserOs } from '@utils/analytics';
import { getTimeAgo } from '@utils/date';
// Types
import { Evaluation, EvaluationInput } from '@typings/evaluation';
import { AnalyticEvents, AnalyticEventsSummary, AnalyticsInput, AnalyticsInputClientInfo } from '@typings/Analytics';
import { Flag } from '@typings/Flag';
import { Activity } from '@typings/Activity';
import { Visitor } from '@typings/Visitors';
import CaptchaRepository from '@repositories/captcha.repository';
import { BOT_DETECTED, CAPTCHA_TOO_LONG } from '@constants/errors';

interface RequestData {
  headers: Request['headers'];
  clientData: AnalyticsInput;
  ip: string;
}

/**
 * @class EvaluationService
 * @description This service is responsible for analyzing and evaluating the user's behavior based
 * on the data collected by the client. The criteria for evaluation are based on the following:
 * 1- Traffic:
 *  - Number of requests per minute
 *  - Average response time per request
 * 2- Events:
 *  - Number of events per minute
 *  - Average time between events
 * 3. User's actions:
 *  - Number of clicks per minute
 *  - Average time between clicks
 *  - Number of mouse movements per minute
 *  - Average time between mouse movements
 * 4. User's activity:
 *  - Number of visits per minute
 *  - Average time between visits
 * 5. User's flags:
 *  - Number of flags per minute
 */
class EvaluationService {
  #hash: string;
  #ip: string | string[];
  #os: string;
  #headers: Request['headers'];
  #clientInformation: AnalyticsInputClientInfo;
  #isMobile: boolean;
  #usersActions: AnalyticEvents[];
  #uniqueUserActions: AnalyticEvents[];
  #eventStats: AnalyticEventsSummary;
  #evaluationRepository: EvaluationRepository;
  #blacklistedIpRepository: BlacklistedIpRepository;
  #captchaRepository: CaptchaRepository;

  constructor(
    hash: string,
    props: RequestData,
    evaluationRepository: EvaluationRepository,
    blacklistedIpRepository: BlacklistedIpRepository,
    captchaRepository: CaptchaRepository
  ) {
    const { headers, clientData, ip } = props;
    this.#hash = hash;
    // console.log('headers', util.inspect(headers, false, null, true));
    // console.log('clientData', util.inspect(clientData, false, null, true));
    this.#evaluationRepository = evaluationRepository;
    this.#blacklistedIpRepository = blacklistedIpRepository;
    this.#captchaRepository = captchaRepository;
    this.#headers = headers;
    this.#ip = ip;
    this.#clientInformation = clientData.clientInformation;
    this.#usersActions = clientData.userActions;
    this.#isMobile = headers['user-agent'].includes('Mobile');
    this.#eventStats = clientData.eventStats;
    this.#determineBrowserOs();
  }

  /**
   * Based on user's latest activities, visits and flags, it determines if the user is a bot or not
   * @param latestActivities
   * @param usersFlags
   */
  async evaluateRequest(latestActivities: Activity[], usersFlags: Flag[], ipVisits: Visitor[]): Promise<void> {
    const captchaScore = await this.#evaluateCaptcha();
    const fingerPrintScore = this.#evaluateBrowserFingerprints();
    const headersScore = await this.#evaluateHeaders();
    const trafficScore = await this.#evaluateTraffic(ipVisits);
    const activityScore = this.#evaluateBrowsingActivity(latestActivities);
    const scores = [fingerPrintScore, headersScore, trafficScore, activityScore];
    let score = scores.reduce((a, b) => a + b, 0) / scores.length;
    // For each flag, deduct 1.5 point from the average score
    score -= usersFlags.length * SCORE.MINOR_SUSP;
    // Add captcha score to the overall score
    score = captchaScore ? (captchaScore + score) / 2 : score;

    await this.#processEvaluation({
      fingerPrintScore,
      headersScore,
      trafficScore,
      activityScore,
      captchaScore,
      score,
      hash: this.#hash,
      ip: this.#ip
    });
  }
  /**
   * Captcha score evaluation is based on 2 criteria:
   * 1. If the user has resolved a captcha
   * 2. If the user has resolved a captcha in a reasonable time
   * 3. The number retries used to resolve the captcha
   * The captcha score is directly added to the overall score
   * Average time to resolve a captcha is 20 seconds: https://datadome.co/bot-management-protection/impact-of-captcha-on-user-experience/
   **/
  async #evaluateCaptcha(): Promise<number> {
    let score = SCORE.MAX;
    const captcha = await this.#captchaRepository.getOne({ hash: this.#hash });
    if (!captcha) {
      return 0;
    }
    if (!captcha.resolved) {
      throw new ForbiddenException(BOT_DETECTED);
    }
    if (captcha.resolutionDuration <= AVG_CAPTCHA_RES_TIME.NORMAL) {
      score -= SCORE.NEGLIGIBLE_SUSP;
    }
    if (captcha.resolutionDuration <= AVG_CAPTCHA_RES_TIME.ABNORMAL) {
      score -= SCORE.MINOR_SUSP;
    }

    // If the user has resolved more than 3 captchas, remove
    if (captcha.retries > AVG_CAPTCHA_RETRIES.NORMAL) {
      score -= SCORE.MINOR_SUSP;
    }

    if (captcha.retries > AVG_CAPTCHA_RETRIES.ABNORMAL) {
      score -= SCORE.LOW_SUSP;
    }

    return score;
  }

  /**
   * Saves the evaluation to the database and decides if the user is a bot or not based on the score
   */
  async #processEvaluation(evaluation: EvaluationInput): Promise<void> {
    const lastEvaluation = await this.#getLastEvaluation();
    const score = Math.floor(evaluation.score);
    await this.#evaluationRepository.create({
      ...evaluation,
      score,
      createdAt: Date.now()
    });
    if (lastEvaluation?.[0]?.score > MIN_HUMAN_SCORE && evaluation.score < MIN_HUMAN_SCORE) {
      throw new ForbiddenException(BOT_DETECTED);
    }
    if (evaluation?.score < HUMAN_SCORE) {
      throw new ForbiddenException(BOT_DETECTED);
    }
  }

  async #getLastEvaluation(): Promise<Evaluation> {
    const query = { hash: this.#hash };
    const options = { limit: 1, sort: { createdAt: -1 } };

    // @ts-ignore
    const evaluation = await this.#evaluationRepository.getMany(query, options);
    return evaluation?.[0];
  }

  #determineBrowserOs() {
    const { platform } = this.#clientInformation;
    const knownOS = browserOs.find((os) => os === platform) || 'Unknown-' + platform;
    this.#isMobile = mobileBrowserOs.includes(knownOS);
    this.#os = knownOS;
  }

  /**
   * Some bots may not have javascript enabled, so we need to check if the browser can execute javascript
   */
  #evaluateJsExecution(score: number): number {
    if (!this.#clientInformation.canExecuteJs) {
      score -= SCORE.SUSPECT;
    }
    return score;
  }

  /**
   * This evaluates the actions performed, such as mouse movements, clicks, and keystrokes
   * Some events such as as focus, blur, and mousemove are not used by bots
   */
  #evaluateBrowsingActivity(latestActivities: Activity[]): number {
    const eventActivityScore = this.#evaluateEventsActivity(latestActivities);
    const activityScore = this.#evaluateActivity();
    const score = [eventActivityScore, activityScore].reduce((a, b) => a + b, 0) / 2;
    return score;
  }

  #evaluateEventsActivity(latestActivities: Activity[]): number {
    let score = SCORE.MAX;
    let events = [];
    if (this.#isMobile) {
      events = EVENTS_MOBILE;
    } else {
      events = EVENTS_DESKTOP;
    }
    if (!this.#usersActions.length) {
      score -= SCORE.MINOR_SUSP;
      return score;
    }
    // Create unique array of user actions based on both event and time
    const filteredActions = this.#usersActions.filter((action) => events.includes(action.event));
    const uniqueActionSet = new Set(filteredActions.filter((v, i, a) => a.findIndex((t) => t.event === v.event && t.time === v.time) === i));
    const uniqueActions = Array.from(uniqueActionSet).sort((a, b) => a.time - b.time);
    // Get all unused
    const unusedEvents = EVENTS_UNUSED_BOTS.filter((event) => !uniqueActions.some((action) => action.event === event));
    this.#uniqueUserActions = uniqueActions;
    // for each unused event, reduce the SCORE
    unusedEvents.forEach(() => {
      score -= SCORE.MINOR_SUSP;
    });

    // Check if the user made use of the mouse
    let clicksAvg = 0;
    latestActivities.forEach((activity) => {
      clicksAvg += activity.avgTClicks;
    });
    clicksAvg = clicksAvg / latestActivities.length;
    // If user clicks are less than the average clicks, then the user is probably a bot
    if (clicksAvg < EVENTS_STATS.AVG_T_CLICKS && clicksAvg > 0) {
      score -= SCORE.MEDIUM_SUSP;
    }
    return score;
  }

  /**
   * Evaluates the number of requests made by the user in the last minute
   */
  async #evaluateTraffic(ipVisits: Visitor[]): Promise<number> {
    let score = SCORE.MAX;
    // Check if the traffic is coming from a proxy
    const query = {
      hash: this.#hash,
      createdAt: {
        $gte: getTimeAgo(1, 'minutes')
      }
    };
    // get the last evaluations on the last minute
    const evalutations = await this.#evaluationRepository.getMany(query);
    // if there are more than 50 evaluations, then the user is probably a bot
    if (evalutations.length >= REQUETS_PER_MIN.MAYBE_HUMAN) {
      score -= SCORE.MEDIUM_SUSP;
    } else if (evalutations.length >= REQUETS_PER_MIN.MAYBE_BOT) {
      score -= SCORE.CRITICAL_SUSP;
    } else if (evalutations.length >= REQUETS_PER_MIN.BOT) {
      score -= SCORE.SUSPECT;
    }

    // Check if the traffic is coming from a proxy

    return score;
  }

  /**
   * Evaluates browser related info
   */
  #evaluateBrowserFingerprints() {
    let score = SCORE.MAX;
    const { connectStart, fetchStart, domContentLoadedEventStart, domContentLoadedEventEnd, unloadEventEnd, unloadEventStart } = this.#clientInformation.performance.timing;
    // Check if the first api call was done at the same time as the connection
    if (connectStart === fetchStart) {
      score -= SCORE.MEDIUM_SUSP;
    }
    // Check if the dom content was loaded and ended at the same time
    if (domContentLoadedEventEnd === domContentLoadedEventStart) {
      score -= SCORE.MEDIUM_SUSP;
    }
    // Check if the unload event was not started and nor ended
    if (!unloadEventEnd && !unloadEventStart) {
      score -= SCORE.MEDIUM_SUSP;
    }
    score = this.#evaluateJsExecution(score);
    return score;
  }

  #evaluateActivity() {
    let score = SCORE.MAX;
    if (this.#eventStats.avgTClicks > MINIMUM_AVERAGE_EVENT_INTERVAL_IN_S) {
      score -= SCORE.LOW_SUSP;
    }
    if (!this.#uniqueUserActions?.length) {
      return score;
    }
    // If the interval between the first and last event is less than 2 seconds, reduce the SCORE
    const firstEvent = this.#uniqueUserActions[0];
    const lastEvent = this.#uniqueUserActions[this.#uniqueUserActions.length - 1];
    const interval = lastEvent.time - firstEvent.time;
    if (interval < MINIMUM_EVENT_INTERVAL) {
      score -= SCORE.LOW_SUSP;
    }

    // Calculate the average time between events
    const averageTimeBetweenEvents =
      this.#uniqueUserActions.reduce((acc, curr, index, arr) => {
        if (index === 0) {
          return 0;
        }
        const previousEvent = arr[index - 1];
        return acc + (curr.time - previousEvent.time);
      }, 0) / this.#uniqueUserActions.length;
    if (averageTimeBetweenEvents < MINIMUM_AVERAGE_EVENT_INTERVAL) {
      score -= SCORE.LOW_SUSP;
    }

    return score;
  }

  /**
   * Evaluates the headers sent by the client
   */
  async #evaluateHeaders(): Promise<number> {
    const userAgentScore = this.#evaluateHeadersUserAgent(this.#headers['user-agent']);
    const protocolScore = this.#evaluateHeadersProtocol(this.#headers['origin']);
    const connectionScore = this.#evaluateHeadersConnection(this.#headers['connection']);
    const ipScore = await this.#evaluateHeadersIP();
    const scores = [userAgentScore, protocolScore, connectionScore, ipScore];
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return averageScore;
  }

  /**
   * Evaluates the user agent and returns a score based on the user agent
   * Some good bots are allowed, but they will still be penalized because bad bots disguise as good bots, so we need to reduce the score even if a 'Good Bot' is detected
   */
  #evaluateHeadersUserAgent(userAgent: string): number {
    let score = SCORE.MAX;
    // We check if the user-agent contains the word 'headless'
    const isHeadless = userAgent.toLowerCase().includes('headless');
    if (isHeadless) {
      score -= SCORE.SUSPECT;
    }
    // We then check if the user-agent contains the word 'bot'
    const isBot = userAgent.toLowerCase().includes('bot');
    const isAllowedBot = allowedBots.some((bot) => userAgent.toLowerCase().includes(bot));
    if (isBot && !isAllowedBot) {
      score -= SCORE.SUSPECT;
    }
    // Some bots may disguise as known bots, so we need to reduce the score even ig a 'Good Bot' is detected
    if (isAllowedBot) {
      score -= SCORE.MEDIUM_SUSP;
    }
    return score;
  }

  #evaluateHeadersProtocol(origin: string): number {
    let score = SCORE.MAX;
    if (!origin.startsWith('https:')) {
      score -= SCORE.HIGH_SUSP;
    }
    return score;
  }

  /**
   * Check if the ip is blacklisted
   */
  async #evaluateHeadersIP(): Promise<number> {
    let score = SCORE.MAX;
    const ip = await this.#blacklistedIpRepository.getOne({ ip: this.#ip });
    if (ip) {
      score -= SCORE.ISBOT;
    }
    //
    return score;
  }


  /**
   * Evaluate if the connection is keep-alive because bots tend to use keep-alive
   */
  #evaluateHeadersConnection(connection: string): number {
    let score = SCORE.MAX;
    if (connection === 'keep-alive') {
      score -= SCORE.HIGH_SUSP;
    }
    return score;
  }
}

export default EvaluationService;
