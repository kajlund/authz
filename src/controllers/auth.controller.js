import { ApiResponse } from '../utils/api.response.js';
import { asyncHandler } from '../middleware/async.handler.js';
import { getAuthServices } from '../services/auth.services.js';
import { getUserServices } from '../services/user.services.js';
import { codes } from '../utils/status.js';
import { ForbiddenError } from '../utils/api.error.js';

export function getAuthController(cnf, log) {
  const svcAuth = getAuthServices(cnf, log);
  const svcUser = getUserServices(cnf, log);

  return {
    getCurrentUser: asyncHandler(async (req, res) => {
      const user = await svcUser.findUserById(req.user.id);
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, user, 'Current user returned'));
    }),
    loginUser: asyncHandler(async (req, res) => {
      const { email, password } = req.locals.payload;
      const tokens = await svcAuth.loginUser(email, password);

      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, tokens, 'User logged in'));
    }),
    logoutUser: asyncHandler(async (req, res) => {
      const { id } = req.user;
      await svcAuth.logoutUser(id);
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, {}, 'User logged out'));
    }),
    updateCurrentUser: asyncHandler(async (req, res) => {
      const { id, payload } = req.locals;
      if (req.user.id !== id)
        throw new ForbiddenError('Cannot change another user profile');

      const updated = await svcUser.updateUser(id, payload);
      res
        .status(codes.OK)
        .json(
          new ApiResponse(codes.OK, updated, `Updated user profile id: ${id}`),
        );
    }),
  };
}
