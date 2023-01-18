import { NextFunction, Request, Response } from 'express';
import { errorHandler, successHandler } from '@core/response';
import { createCaptchaService, createFingerPrintService } from '@factories/service.factory';

export const createCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();
    const captchaService = createCaptchaService(req, fingerPrintHash);
    const captcha = await captchaService.createCaptcha();
    successHandler(res, captcha);
  } catch (error) {
    errorHandler(next, error);
  }
};

export const resolveCaptcha = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { captcha } = req.params;
    const fingerPrintService = createFingerPrintService(req);
    const fingerPrintHash = await fingerPrintService.generateHash();
    const captchaService = createCaptchaService(req, fingerPrintHash);
    await captchaService.resolveCaptcha(captcha);
    successHandler(res);
  } catch (error) {
    errorHandler(next, error);
  }
};
