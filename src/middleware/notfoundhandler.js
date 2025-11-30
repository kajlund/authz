import { NotFoundError } from '../utils/api-error.js';

export function getNotFoundHandler() {
  return (req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} was not found`));
  };
}
