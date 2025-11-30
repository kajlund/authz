import { codes, phrases } from './status.js';

class ApiError extends Error {
  constructor(
    statusCode = codes.INTERNAL_SERVER_ERROR,
    message = phrases.INTERNAL_SERVER_ERROR,
    detail = '',
    errors = [],
    stack = '',
  ) {
    super(message);
    this.name = this.constructor.name;
    this.isApiError = true;
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.detail = detail;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.BAD_REQUEST, phrases.BAD_REQUEST, detail, errors, stack);
  }
}

export class ConflictError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.CONFLICT, phrases.CONFLICT, detail, errors, stack);
  }
}
export class ForbiddenError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.FORBIDDEN, phrases.FORBIDDEN, detail, errors, stack);
  }
}
export class InternalServerError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.INTERNAL_SERVER_ERROR, phrases.INTERNAL_SERVER_ERROR, detail, errors, stack);
  }
}
export class NotFoundError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.NOT_FOUND, phrases.NOT_FOUND, detail, errors, stack);
  }
}
export class NotImplementedError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.NOT_IMPLEMENTED, phrases.NOT_IMPLEMENTED, detail, errors, stack);
  }
}
export class UnauthorizedError extends ApiError {
  constructor(detail = '', errors = [], stack = '') {
    super(codes.UNAUTHORIZED, phrases.UNAUTHORIZED, detail, errors, stack);
  }
}
