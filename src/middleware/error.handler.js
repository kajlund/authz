import { codes, phrases } from '../utils/status.js';

export function getErrorHandler(log) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (err.isApiError) {
      const error = {
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        detail: err.detail,
      };
      if (err.errors && err.errors.name === 'ZodError') {
        error.errors = err.errors?.issues;
      }
      return res.status(err.statusCode).json(error);
    }

    // Generic error
    log.error(err);
    return res.status(codes.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: codes.INTERNAL_SERVER_ERROR,
      message: phrases.INTERNAL_SERVER_ERROR,
      detail: '',
    });
  };
}
