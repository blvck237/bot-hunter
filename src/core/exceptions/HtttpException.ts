/* eslint-disable max-classes-per-file */
import httpStatus from 'http-status';

export default class HttpException extends Error {
  status: any;
  constructor(message: string, status: number) {
    super(message);
    this.message = message;
    this.status = status || httpStatus.INTERNAL_SERVER_ERROR;
  }
}
