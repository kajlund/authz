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

export function getBadRequestError(details = '', errors = [], stack = '') {
  return new ApiError(codes.BAD_REQUEST, phrases.BAD_REQUEST, details, errors, stack);
}

export function getUnauthorizedError(details = '', errors = [], stack = '') {
  return new ApiError(codes.UNAUTHORIZED, phrases.UNAUTHORIZED, details, errors, stack);
}

export function getConflictError(details = '', errors = [], stack = '') {
  return new ApiError(codes.CONFLICT, phrases.CONFLICT, details, errors, stack);
}

export function getInternalError(details = '', errors = [], stack = '') {
  return new ApiError(codes.INTERNAL_SERVER_ERROR, phrases.INTERNAL_SERVER_ERROR, details, errors, stack);
}

export function getNotImplementedError(details = '', errors = [], stack = '') {
  return new ApiError(codes.NOT_IMPLEMENTED, phrases.NOT_IMPLEMENTED, details, errors, stack);
}
