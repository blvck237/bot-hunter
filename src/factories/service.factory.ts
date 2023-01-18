import { Request } from 'express';
// Services@services/evaluation.service
import EvaluationService from '@services/evaluation.service';
import FingerPrintService from '@services/fingerprint.service';
// Repositories
import EvaluationRepository from '@repositories/evaluation.repository';
// Types
import { AnalyticsInput } from '@typings/Analytics';
import { ActivityRepository } from '@repositories/activity.repository';
import ActivityService from '@services/activity.service';
import { ACTIVITY_COLLECTION, BLACKLISTED_IPS_COLLECTION, CAPTCHA_COLLECTION, EVALUATIONS_COLLECTION, FLAG_COLLECTION, VISITOR_COLLECTION } from '@constants/collections';
import BlacklistedIpRepository from '@repositories/black-listed-ip.repository';
import FlagService from '@services/flag.service';
import FlagRepository from '@repositories/flag.repository';
import VisitorService from '@services/visitor.service';
import VisitorRepository from '@repositories/visitor.repository';
import CaptchaService from '@services/captcha.service';
import CaptchaRepository from '@repositories/black-listed-ip.repository';

export const createEvaluationService = (req: Request, hash: string): EvaluationService => {
  const { headers, body, ip }: { headers: Request['headers']; body: AnalyticsInput; ip: string } = req;
  const evaluationRepository = new EvaluationRepository(EVALUATIONS_COLLECTION);
  const blacklistedIpRepository = new BlacklistedIpRepository(BLACKLISTED_IPS_COLLECTION);
  const captchaRepository = new CaptchaRepository(CAPTCHA_COLLECTION);

  return new EvaluationService(hash, { headers, clientData: body, ip }, evaluationRepository, blacklistedIpRepository, captchaRepository);
};

export const createFingerPrintService = (req: Request): FingerPrintService => {
  const { headers, body }: { headers: Request['headers']; body: AnalyticsInput } = req;
  return new FingerPrintService({
    userAgent: headers['user-agent'],
    colorDepth: body.clientInformation.screen.colorDepth,
    language: body.clientInformation.language,
    screenWidth: body.clientInformation.screen.width,
    screenHeight: body.clientInformation.screen.height,
    timezone: body.clientInformation.timeZone
  });
};

export const createActivityService = (req: Request, hash: string): ActivityService => {
  const activityRepository = new ActivityRepository(ACTIVITY_COLLECTION);
  return new ActivityService({
    hash,
    activityRepository,
    ip: req.clientIp
  });
};

export const createFlagService = (req: Request, hash: string): FlagService => {
  const flagRepository = new FlagRepository(FLAG_COLLECTION);
  return new FlagService({
    hash,
    flagRepository,
    ip: req.clientIp
  });
};

export const createVisitorService = (req: Request, hash: string): VisitorService => {
  const visitorRepository = new VisitorRepository(VISITOR_COLLECTION);
  return new VisitorService({
    hash,
    visitorRepository,
    ip: req.clientIp
  });
};

export const createCaptchaService = (req: Request, hash: string): CaptchaService => {
  const captchaRepository = new CaptchaRepository(CAPTCHA_COLLECTION);
  return new CaptchaService({
    hash,
    captchaRepository,
    ip: req.clientIp
  });
};
