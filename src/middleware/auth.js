import { getSessionServices } from '../services/session.services.js';
import { UnauthorizedError } from '../utils/errors.js';

export function getAuthHandler(log) {
  const svcSession = getSessionServices(log);

  return async (req, res, next) => {
    const user = await svcSession.checkSession(req.headers['x-session']);
    if (!user) next(new UnauthorizedError('Invalid creadentials'));
    req.user = user;
    next();
  };
}
