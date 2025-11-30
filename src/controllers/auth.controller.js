import { BadRequestError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getUserServices } from '../services/user.services.js';
import { loginPayloadSchema, signupPayloadSchema } from '../utils/validators.js';
import { codes } from '../utils/status.js';

export function getAuthController(cnf, log) {
  const svcUser = getUserServices(cnf, log);

  return {
    changePassword: asyncHandler(async (req, res) => {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      await svcUser.changePassword(req.user.id, oldPassword, newPassword, confirmPassword);

      res.status(codes.OK).json(new ApiResponse(codes.OK, {}, 'Password successfully changed'));
    }),
    getCurrentUser: asyncHandler(async (req, res) => {
      const user = await svcUser.findUserById(req.user.id);

      res.status(codes.OK).json(new ApiResponse(codes.OK, { data: user }, `User information for ${user.alias}`));
    }),
    login: asyncHandler(async (req, res) => {
      const vld = loginPayloadSchema.safeParse(req.body);
      if (!vld.success) throw new BadRequestError('Faulty login data', vld.error);
      const data = await svcUser.loginUser(vld.data);

      // Return response and set cookies
      const opt = { httpOnly: true, secure: true };
      res
        .status(codes.OK)
        .cookie('accessToken', data.accessToken, opt)
        .cookie('refreshToken', data.refreshToken, opt)
        .json(new ApiResponse(codes.OK, data, `User ${data.user.alias} logged in`));
    }),
    logout: asyncHandler(async (req, res) => {
      // Clear user refresh token
      const data = await svcUser.logoutUser(req.user.id);

      // Return response clearing cookies
      const opt = { httpOnly: true, secure: true };
      res
        .status(codes.OK)
        .clearCookie('accessToken', opt)
        .clearCookie('refreshToken', opt)
        .json(new ApiResponse(codes.OK, data, `User ${data.alias} logged out`));
    }),
    refreshAccessToken: asyncHandler(async (req, res) => {
      const token = req.cookies.refreshToken || req.body?.refreshtoken;
      const data = await svcUser.refreshAccessToken(token);
      const opt = { httpOnly: true, secure: true };
      res
        .status(codes.OK)
        .cookie('accessToken', data.accessToken, opt)
        .cookie('refreshToken', data.refreshToken, opt)
        .json(new ApiResponse(codes.OK, data, 'Tokens refreshed'));
    }),
    register: asyncHandler(async (req, res) => {
      const verificationPath = `${req.protocol}://${req.get('host')}/api/v1/auth/verify`;
      const vld = signupPayloadSchema.safeParse(req.body);
      if (!vld.success) throw new BadRequestError('Faulty user data', vld.error);
      const data = await svcUser.signupUser(vld.data, verificationPath);

      res.status(codes.CREATED).json(new ApiResponse(codes.CREATED, data, `User successfully registered`));
    }),
    resendVerifyEmail: asyncHandler(async (req, res) => {
      const verificationPath = `${req.protocol}://${req.get('host')}/api/v1/auth/verify`;
      const data = await svcUser.resendVerification(req.user.id, verificationPath);
      res.status(codes.OK).json(new ApiResponse(codes.OK, data, 'Verification email was sent'));
    }),
    resetPassword: asyncHandler(async (req, res) => {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body;
      await svcUser.resetPassword(token, newPassword, confirmPassword);

      res.status(codes.OK).json(new ApiResponse(codes.OK, {}, 'Password successfully changed'));
    }),
    sendPasswordResetMail: asyncHandler(async (req, res) => {
      const resetPath = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword`;
      const { email } = req.body;
      const data = await svcUser.sendPasswordResetEmail(email, resetPath);

      res.status(codes.OK).json(new ApiResponse(codes.OK, data, 'Password reset email has been sent'));
    }),
    verifyEmail: asyncHandler(async (req, res) => {
      const { token } = req.params;
      const user = await svcUser.verifyAccount(token);

      res.status(codes.OK).json(new ApiResponse(codes.OK, { user }, 'User account verified'));
    }),
  };
}
