import { NotFoundError } from '../utils/errors.js';

export function getNotFoundHandler() {
  return (req, res, next) => {
    next(new NotFoundError(`Route ${req.originalUrl} was not found`));
  };
}
