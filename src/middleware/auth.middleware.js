import { asyncHandler } from '../utils/async-handler.js';
import { getAuthUtils } from '../utils/auth.utils.js';
import { getUnauthorizedError } from '../utils/api-error.js';

export function getAuthMiddleware(cnf, log) {
  const auth = getAuthUtils(cnf, log);

  return {
    checkRole: (role) => {
      return function (req, res, next) {
        if (req.user?.role === role) return next();
        next(getUnauthorizedError(`You are not autorized for this route as a user with role ${req.user?.role}`));
      };
    },
    isAuthenticated: asyncHandler(async (req, res, next) => {
      // Ensure we have a token or throw unauhtorized error
      const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
      if (!token) throw getUnauthorizedError('Invalid creadentials');
      // Verify token or throw unauhtorized error
      const verified = auth.verifyAccessToken(token);

      // If verified add user info to request
      if (!verified) next(getUnauthorizedError('Invalid creadentials'));
      req.user = verified;
      next();
    }),
  };
}
