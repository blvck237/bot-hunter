import { NextFunction, Response } from 'express';
import httpStatus from 'http-status';

interface Error {
  status?: number;
  message?: string;
}


export const successHandler = (res: Response, data?: any) => {
  res.status(httpStatus.OK).json(data);
};

export function errorHandler(next: NextFunction, err: Error) {
  next(err);
}
