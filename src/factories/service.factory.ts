import { Request } from 'express';
// Services@services/evaluation.service
import EvaluationService from '@services/evaluation.service';
import FingerPrintService from '@services/fingerprint.service';
// Repositories
import EvaluationRepository from '@repositories/evaluation.repository';
// Types
import { AnalyticsInput } from '@typings/Analytics';

export const createEvaluationService = (req: Request, hash: string) => {
  const { headers, body, ip }: { headers: Request['headers']; body: AnalyticsInput; ip: string } = req;
  const evaluationRepository = new EvaluationRepository('evaluations');
  return new EvaluationService(hash, { headers, clientData: body, ip }, evaluationRepository);
};

export const createFingerPrintService = (req: Request) => {
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
