import { getSessionServices } from '../services/session.services.js';
import { UnauthorizedError } from '../utils/errors.js';

export function getAuthHandlers(cnf, log) {
  const svcSession = getSessionServices(cnf, log);

  return {
    checkRole: (role) => {
      return function (req, res, next) {
        if (req.user?.role === role) return next();
        next(new UnauthorizedError(`You are not autorized for this route as a user with role ${req.user?.role}`));
      };
    },
    isAuthenticated: async (req, res, next) => {
      // const user = await svcSession.checkSession(req.headers['x-session']);
      const authHeader = req.headers['authorization'];
      if (!authHeader.startsWith('Bearer')) next(new UnauthorizedError('Invalid creadentials'));
      const token = authHeader.split(' ')[1];
      const verified = svcSession.verifyJWT(token);
      if (!verified) next(new UnauthorizedError('Invalid creadentials'));
      req.user = verified;
      next();
    },
  };
}
