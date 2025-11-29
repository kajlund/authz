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

export function getBadRequestError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.BAD_REQUEST, phrases.BAD_REQUEST, detail, errors, stack);
}

export function getConflictError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.CONFLICT, phrases.CONFLICT, detail, errors, stack);
}

export function getForbiddenError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.FORBIDDEN, phrases.FORBIDDEN, detail, errors, stack);
}

export function getInternalError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.INTERNAL_SERVER_ERROR, phrases.INTERNAL_SERVER_ERROR, detail, errors, stack);
}

export function getNotFoundError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.NOT_FOUND, phrases.NOT_FOUND, detail, errors, stack);
}

export function getNotImplementedError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.NOT_IMPLEMENTED, phrases.NOT_IMPLEMENTED, detail, errors, stack);
}

export function getUnauthorizedError(detail = '', errors = [], stack = '') {
  return new ApiError(codes.UNAUTHORIZED, phrases.UNAUTHORIZED, detail, errors, stack);
}
