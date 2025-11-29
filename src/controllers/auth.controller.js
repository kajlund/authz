import { getBadRequestError, getNotImplementedError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getUserServices } from '../services/user.services.js';
import { loginPayloadSchema, signupPayloadSchema } from '../utils/validators.js';
import { codes } from '../utils/status.js';

export function getAuthController(cnf, log) {
  const svcUser = getUserServices(cnf, log);

  return {
    login: async function (req, res, next) {
      try {
        const vld = loginPayloadSchema.safeParse(req.body);
        if (!vld.success) throw getBadRequestError('Faulty login data', vld.error);
        const { accessToken, refreshToken } = await svcUser.loginUser(vld.data);
        res.status(codes.OK).json({
          success: true,
          status: codes.OK,
          message: 'User logged in',
          credentials: { accessToken, refreshToken },
        });
      } catch (err) {
        next(err);
      }
    },
    logout: asyncHandler(async () => {
      throw getNotImplementedError('Logout has not been implemented yet');
    }),
    register: asyncHandler(async (req, res) => {
      const verificationPath = `${req.protocol}://${req.get('host')}/api/v1/users/verify-email`;
      const vld = signupPayloadSchema.safeParse(req.body);
      if (!vld.success) throw getBadRequestError('Faulty user data', vld.error);
      const data = await svcUser.signupUser(vld.data, verificationPath);

      res.status(codes.CREATED).json(new ApiResponse(codes.CREATED, data, 'User successfully registered'));
    }),
  };
}
