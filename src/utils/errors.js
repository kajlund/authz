import { codes, phrases } from './status.js';

/**
 * AppError class to throw handled error responses
 */
export class AppError extends Error {
  constructor(message = phrases.INTERNAL_SERVER_ERROR, code = codes.INTERNAL_SERVER_ERROR, detail = '') {
    super(message);
    this.name = this.constructor.name;
    this.isAppError = true;
    this.statusCode = code;
    this.detail = detail;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail = '') {
    super(phrases.UNAUTHORIZED, codes.UNAUTHORIZED, detail);
  }
}
export class BadRequestError extends AppError {
  constructor(detail = '', errors = null) {
    super(phrases.BAD_REQUEST, codes.BAD_REQUEST, detail);
    this.errors = errors;
  }
}
export class NotFoundError extends AppError {
  constructor(detail = '') {
    super(phrases.NOT_FOUND, codes.NOT_FOUND, detail);
  }
}

export class InternalServerError extends AppError {
  constructor(detail = '') {
    super(phrases.INTERNAL_SERVER_ERROR, codes.INTERNAL_SERVER_ERROR, detail);
  }
}
