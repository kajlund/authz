import { getNotFoundError } from '../utils/api-error.js';

export function getNotFoundHandler() {
  return (req, res, next) => {
    next(getNotFoundError(`Route ${req.originalUrl} was not found`));
  };
}
