import { Request } from 'express';
import util from 'util';
import { AnalyticEvents, AnalyticsInput, AnalyticsInputClientInfo } from '@typings/Analytics';
import { allowedBots, mobileBrowserOs, browserOs } from '@utils/analytics';
import { EVENTS_DESKTOP, EVENTS_MOBILE, EVENTS_UNUSED_BOTS } from '@constants/event';
import { HUMAN_SCORE, MINIMUM_AVERAGE_EVENT_INTERVAL, MINIMUM_EVENT_INTERVAL, REQUETS_PER_MIN, SCORE } from '@constants/analytics';
import EvaluationRepository from '@repositories/evaluation.repository';
import { Evaluation, EvaluationInput } from '@typings/evaluation';
import { ForbiddenException } from '@core/exceptions';
import { getTimeAgo } from '@utils/date';
import { LoggerInstance } from '@utils/logger';

interface RequestData {
  headers: Request['headers'];
  clientData: AnalyticsInput;
  ip: string;
}

class EvaluationService {
  #score: number;
  #userAgent: string;
  #host: string;
  #hash: string;
  #referer: string;
  #ip: string | string[];
  #origin: string;
  #connection: string;
  #accept: string;
  #forwarded: string | string[];
  #forwardedFor: string | string[];
  #os: string;
  #clientInformation: AnalyticsInputClientInfo;
  #isMobile: boolean;
  #usersActions: AnalyticEvents[];
  #uniqueUserActions: AnalyticEvents[];
  #evaluationRepository: EvaluationRepository;

  constructor(hash: string, props: RequestData, evaluationRepository: EvaluationRepository) {
    this.#hash = hash;
    const { headers, clientData, ip } = props;
    // console.log('headers', util.inspect(headers, false, null, true));
    // console.log('clientData', util.inspect(clientData, false, null, true));
    this.#evaluationRepository = evaluationRepository;
    this.#score = SCORE.MAX;
    this.#userAgent = headers['user-agent'];
    this.#host = headers.host;
    this.#referer = headers.referer;
    this.#ip = ip;
    this.#origin = headers.origin;
    this.#connection = headers.connection;
    this.#accept = headers.accept;
    this.#forwarded = headers['x-forwarded'];
    this.#forwardedFor = headers['x-forwarded-for'];
    this.#clientInformation = clientData.clientInformation;
    this.#usersActions = clientData.userActions;
    this.#isMobile = this.#userAgent.includes('Mobile');
  }

  async evaluateRequest(): Promise<void> {
    const evaluation = await this.getLatestEvaluation();
    if (evaluation?.score < HUMAN_SCORE) {
      const message = `Bot detected on this IP: ${this.#ip}`;
      throw new ForbiddenException(message);
    }
    this.#determineBrowserOs();
    const fingerPrintScore = this.#evaluateBrowserFingerprints();
    const jsExecutionScore = this.#evaluateJsExecution();
    const protocolScore = this.#evaluateProtocol();
    const trafficScore = await this.#evaluateTraffic();
    const eventsScore = this.#evaluateBrowsingEvents();
    const activityScore = this.#evaluateActivityTime();
    const userAgentScore = this.#evaluateUserAgent();
    const scores = [fingerPrintScore, jsExecutionScore, protocolScore, trafficScore, eventsScore, activityScore, userAgentScore];
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.#saveEvaluation({
      fingerPrintScore,
      jsExecutionScore,
      protocolScore,
      trafficScore,
      eventsScore,
      activityScore,
      userAgentScore,
      score: Math.floor(averageScore),
      hash: this.#hash,
      ip: this.#ip
    });
  }

  async getLatestEvaluation() {
    const query = { hash: this.#hash };
    const evalutation = await this.#evaluationRepository.getMany(query, { sort: { _id: -1 }, limit: 1 });
    return evalutation[0];
  }

  async #saveEvaluation(evaluation: EvaluationInput): Promise<Evaluation> {
    console.log('Saving evaluation', evaluation);
    const savedEvaluation = await this.#evaluationRepository.create({
      ...evaluation,
      createdAt: Date.now()
    });
    return savedEvaluation;
  }

  #determineBrowserOs() {
    const { platform } = this.#clientInformation;
    const knownOS = browserOs.find((os) => os === platform) || 'Unknown-' + platform;
    this.#isMobile = mobileBrowserOs.includes(knownOS);
    this.#os = knownOS;
  }

  #evaluateUserAgent() {
    let score = SCORE.MAX;
    // We check if the user-agent contains the word 'headless'
    const isHeadless = this.#userAgent.toLowerCase().includes('headless');
    if (isHeadless) {
      score -= SCORE.SUSPECT;
    }
    // We then check if the user-agent contains the word 'bot'
    const isBot = this.#userAgent.toLowerCase().includes('bot');
    const isAllowedBot = allowedBots.some((bot) => this.#userAgent.toLowerCase().includes(bot));
    if (isBot && !isAllowedBot) {
      score -= SCORE.SUSPECT;
    }
    // Some bots may disguise as known bots, so we need to reduce the score even ig a 'Good Bot' is detected
    if (isAllowedBot) {
      score -= SCORE.MEDIUM_SUSP;
    }
    return score;
  }

  #evaluateJsExecution() {
    let score = SCORE.MAX;
    if (!this.#clientInformation.canExecuteJs) {
      score -= SCORE.SUSPECT;
    }
    return score;
  }

  #evaluateBrowsingEvents() {
    let score = SCORE.MAX;
    if (!this.#usersActions.length) {
      score -= SCORE.MINOR_SUSP;
      return score;
    }

    let events = [];
    if (this.#isMobile) {
      events = EVENTS_MOBILE;
    } else {
      events = EVENTS_DESKTOP;
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
      score -= SCORE.LOW_SUSP;
    });
    return score;
  }

  async #evaluateTraffic() {
    let score = SCORE.MAX;
    // Check if the traffic is coming from a proxy
    // Evaluate bounce rate
    const query = {
      hash: this.#hash,
      createdAt: {
        $gte: getTimeAgo(1, 'minutes')
      }
    };
    // get the last evaluations on the last minute
    const evalutations = await this.#evaluationRepository.getMany(query);
    console.log(evalutations.length, ' Requests in the last minute');
    // if there are more than 50 evaluations, then the user is probably a bot
    if (evalutations.length >= REQUETS_PER_MIN.MAYBE_HUMAN) {
      score -= SCORE.MEDIUM_SUSP;
    } else if (evalutations.length >= REQUETS_PER_MIN.MAYBE_BOT) {
      score -= SCORE.CRITICAL_SUSP;
    } else if (evalutations.length >= REQUETS_PER_MIN.BOT) {
      score -= SCORE.SUSPECT;
    }
    return score;

    // Sessions in the range of milliseconds are suspicious
  }

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
    return score;
  }

  #evaluateActivityTime() {
    let score = SCORE.MAX;
    if (!this.#uniqueUserActions?.length) {
      return score;
    }
    // If the interval between the first and last event is less than 2 seconds, reduce the SCORE
    const firstEvent = this.#uniqueUserActions[0];
    const lastEvent = this.#uniqueUserActions[this.#uniqueUserActions.length - 1];
    const interval = lastEvent.time - firstEvent.time;
    console.log(interval, ' Interval between first and last event');
    if (interval < MINIMUM_EVENT_INTERVAL) {
      score -= SCORE.MEDIUM_SUSP;
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
      score -= SCORE.MEDIUM_SUSP;
    }
    return score;
  }

  #evaluateProtocol() {
    let score = SCORE.MAX;
    if (this.#clientInformation.location.protocol !== 'https:') {
      score -= SCORE.MEDIUM_SUSP;
    }
    return score;
  }
}

export default EvaluationService;
