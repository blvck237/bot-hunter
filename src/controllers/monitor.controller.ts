import { NextFunction, Request, Response } from 'express';
import EvaluationService from '@services/evaluation.service';
import FingerPrintService from '@services/fingerprint.service';
import { errorHandler, successHandler } from '@core/response';
import { AnalyticsInput } from '@typings/Analytics';
import { createEvaluationService, createFingerPrintService } from '@factories/service.factory';

export const evaluateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create fingerprint and hash it
    const fingerPrintService = createFingerPrintService(req);
    // Check if fingerprint exists in database
    const fingerPrintHash = await fingerPrintService.generateHash();
    const evaluationService = createEvaluationService(req, fingerPrintHash);
    await evaluationService.evaluateRequest();
    // const lastEvaluation = await evaluationService.getLatestEvaluation(fingerPrintHash);

    successHandler(res);
    // Evaluate request
    // If evaluation is less than 10, we consider it as a bot
  } catch (error) {
    errorHandler(next, error);
  }
};

export const evaluateRtt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();
    // const evaluationService = createEvaluationService(req, fingerPrintHash);
    // await evaluationService.evaluateRtt(body);

    successHandler(res);
  } catch (error) {
    errorHandler(next, error);
  }
};
