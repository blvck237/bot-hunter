import { Response, Request, NextFunction } from 'express';
import { LoggerInstance } from '@utils/logger';

const INTERNAL_SERVER_ERROR_MESSAGE = 'ERROR__INTERNAL_SERVER';

export const errorMiddleware = (err, req: Request, res: Response, next: NextFunction) => {
  let messageToDisplay: string;
  if (err.status === undefined) {
    err.status = 500;
    messageToDisplay = INTERNAL_SERVER_ERROR_MESSAGE;
  }
  LoggerInstance.error({
    level: 'error',
    message: `${err.status} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  });
  messageToDisplay = err.message;
  res.status(err.status).json({ code: err.status, success: false, message: messageToDisplay });
};
