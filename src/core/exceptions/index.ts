// eslint-disable-next-line max-classes-per-file
import httpStatus from 'http-status';
import HttpException from './HtttpException';

class BadRequestException extends HttpException {
  constructor(message: string) {
    super(message, httpStatus.BAD_REQUEST);
  }
}

class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(message, httpStatus.UNAUTHORIZED);
  }
}

class NotFoundException extends HttpException {
  constructor(message: string) {
    super(message, httpStatus.NOT_FOUND);
  }
}

class AlreadyExistException extends HttpException {
  constructor(message: string) {
    super(message, httpStatus.CONFLICT);
  }
}

class ForbiddenException extends HttpException {
  constructor(message: string) {
    super(message, httpStatus.FORBIDDEN);
  }
}

export { HttpException, BadRequestException, UnauthorizedException, NotFoundException, AlreadyExistException, ForbiddenException };
