import { getAuthUtils } from '../utils/auth.utils.js';
import { getUserDAO } from '../db/user.dao.js';
import { InternalServerError, UnauthorizedError } from '../utils/api.error.js';

export const getAuthServices = (cnf, log) => {
  const authUtils = getAuthUtils(cnf, log);
  const dao = getUserDAO(log);

  return {
    loginUser: async (email, password) => {
      // verify that user exists
      const user = await dao.findUserByEmail(email);
      if (!user) throw new UnauthorizedError('Invalid credentials');
      const pwdOK = await authUtils.comparePasswords(password, user.password);
      if (!pwdOK) throw new UnauthorizedError('Invalid credentials');
      // Generate tokens
      const accessToken = authUtils.generateAccessToken(user);
      const refreshToken = authUtils.generateRefreshToken(user.id);
      // Store refresh token
      const updated = await dao.updateUser(user.id, { refreshToken });
      if (!updated) throw new InternalServerError('Failed to set refreshToken');

      return { accessToken, refreshToken };
    },
    logoutUser: async (id) => {
      const user = await dao.updateUser(id, { refreshToken: '' });
      if (!user) throw new InternalServerError('Failed to clear refreshToken');
    },
  };
};
