import { ApiResponse } from '../utils/api.response.js';
import { asyncHandler } from '../middleware/async.handler.js';
import { getAuthServices } from '../services/auth.services.js';
import { codes } from '../utils/status.js';

export function getAuthController(cnf, log) {
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    // domain: cnf.isDev ? 'localhost' : '.kajlund.com',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const svcAuth = getAuthServices(cnf, log);

  return {
    getCurrentUser: asyncHandler(async (req, res) => {
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, req.user, 'Current user returned'));
    }),
    loginUser: asyncHandler(async (req, res) => {
      const { email, password } = req.locals.payload;
      const tokens = await svcAuth.loginUser(email, password);

      res
        .status(codes.OK)
        .cookie('accessToken', tokens.accessToken, options)
        .cookie('refreshToken', tokens.refreshToken, options)
        .json(new ApiResponse(codes.OK, tokens, 'User logged in'));
    }),
    logoutUser: asyncHandler(async (req, res) => {
      const { id } = req.user;
      await svcAuth.logoutUser(id);
      res
        .status(codes.OK)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new ApiResponse(codes.OK, {}, 'User logged out'));
    }),
  };
}
