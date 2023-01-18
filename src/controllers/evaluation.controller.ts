import { NextFunction, Request, Response } from 'express';
import { errorHandler, successHandler } from '@core/response';
import { createActivityService, createEvaluationService, createFingerPrintService, createFlagService, createVisitorService } from '@factories/service.factory';

export const evaluateRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Create fingerprint and hash it
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();


    const flagService = createFlagService(req, fingerPrintHash);
    const activityService = createActivityService(req, fingerPrintHash);
    const evaluationService = createEvaluationService(req, fingerPrintHash);
    const visitorService = createVisitorService(req, fingerPrintHash);

    await activityService.registerActivity({
      avgTClicks: req.body.eventStats.avgTClicks,
      avgTKeydown: req.body.eventStats.avgTKeydown,
      avgTScroll: req.body.eventStats.avgTScroll
    });

    const latestActivities = await activityService.getLatestActivity();
    const usersFlags = await flagService.getAllFlags();
    const ipVisits = await visitorService.getTodayVisitByIp();

    await evaluationService.evaluateRequest(latestActivities, usersFlags, ipVisits);

    successHandler(res, {});
  } catch (error) {
    errorHandler(next, error);
  }
};

export const flagUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();
    const flagService = createFlagService(req, fingerPrintHash);
    await flagService.flagUser(body.flagData);
    successHandler(res);
  } catch (error) {
    errorHandler(next, error);
  }
};
