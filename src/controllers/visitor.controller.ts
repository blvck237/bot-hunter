import { NextFunction, Request, Response } from 'express';
import { errorHandler, successHandler } from '@core/response';
import { createFingerPrintService, createVisitorService } from '@factories/service.factory';

export const registerVisitor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();
    const visitorService = createVisitorService(req, fingerPrintHash);
    await visitorService.registerVisitor({
      visitedAt: body.visitedAt,
      page: body.page
    });
    successHandler(res);
  } catch (error) {
    errorHandler(next, error);
  }
};
