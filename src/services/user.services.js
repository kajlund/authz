import { getAuthUtils } from '../utils/auth.utils.js';
import { getMailer, accountVerificationEmailContent, forgotPasswordEmailContent } from '../utils/emailer.js';
import {
  getBadRequestError,
  getConflictError,
  getInternalError,
  getNotFoundError,
  getUnauthorizedError,
} from '../utils/api-error.js';
import { getUserDAO } from '../db/user.dao.js';

function _getSanitizedUser(user) {
  const { id, alias, email, avatar, role, createdAt, updatedAt } = user;
  return {
    id,
    alias,
    email,
    avatar,
    role,
    createdAt,
    updatedAt,
  };
}

export function getUserServices(cnf, log) {
  const dao = getUserDAO(log);
  const auth = getAuthUtils(cnf, log);
  const mailer = getMailer(cnf, log);

  return {
    changePassword: async function (id, oldPwd, pwd, confirm) {
      if (pwd !== confirm) throw getBadRequestError('Passwords do not match');
      const found = await dao.findUserById(id);
      if (!found) throw getNotFoundError('User not found trying to change password');

      // Verify old pwd
      const pwdOK = await auth.comparePasswords(oldPwd, found.password);
      if (!pwdOK) throw getBadRequestError('Old password incorrect');

      // Hash new pwd and update
      const hashedPwd = await auth.generatePasswordHash(pwd);
      const updatedUser = await dao.updateUser(found.id, { password: hashedPwd });
      if (!updatedUser) throw getInternalError('Error updating user password');
    },
    findUserById: async function (id) {
      const found = await dao.findUserById(id);
      if (!found) return null;
      return _getSanitizedUser(found);
    },
    loginUser: async function (loginData) {
      const { email, password } = loginData;
      // verify that user exists
      const foundUser = await dao.findUserByEmail(email);
      if (!foundUser) throw getUnauthorizedError('Invalid credentials');
      // Verify pwd
      const pwdOK = await auth.comparePasswords(password, foundUser.password);
      if (!pwdOK) throw getUnauthorizedError('Invalid credentials');

      // Password matched. Create session
      const accessToken = auth.generateAccessToken(foundUser);
      const refreshToken = auth.generateRefreshToken(foundUser.id);

      const updatedUser = await dao.updateUser(foundUser.id, { refreshToken });
      if (!updatedUser) throw getInternalError('Error generating tokens for user');

      const user = _getSanitizedUser(updatedUser);

      return {
        user,
        accessToken,
        refreshToken,
      };
    },
    logoutUser: async function (userId) {
      const updatedUser = await dao.updateUser(userId, { refreshToken: '' });
      if (!updatedUser) throw getInternalError('Logging out user failed');
      return _getSanitizedUser(updatedUser);
    },
    refreshAccessToken: async function (token) {
      // Validate refresh token
      const incomingRefreshToken = auth.verifyRefreshToken(token);
      if (!incomingRefreshToken) throw getUnauthorizedError('Invalid refresh token');

      const user = await dao.findUserById(incomingRefreshToken.id);
      if (!user) throw getUnauthorizedError('Invalid refresh token');

      if (token !== user.refreshToken) throw getUnauthorizedError('Refresh token has expired');

      const accessToken = auth.generateAccessToken(user);
      const refreshToken = auth.generateRefreshToken(user.id);
      const updatedUser = await dao.updateUser(user.id, { refreshToken });
      if (!updatedUser) throw getInternalError('Error generating tokens for user');

      const userObj = _getSanitizedUser(updatedUser);

      return {
        user: userObj,
        accessToken,
        refreshToken,
      };
    },
    resendVerification: async function (userId, verificationPath) {
      const user = await dao.findUserById(userId);
      if (!user) throw getNotFoundError('User not found');
      if (user.verified) throw getConflictError(`User ${user.alias} is already verified`);
      // Create new temp token
      const token = auth.generateTemporaryToken();
      const data = {
        verificationToken: token.hashedToken,
        verificationExpires: new Date(token.tokenExpiry),
      };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw getInternalError('Error updating verification token');

      // Send account verification email
      const verificationUrl = `${verificationPath}/${token.unhashedToken}`;
      mailer.sendMail({
        verificationUrl: updatedUser.email,
        subject: 'Verify account',
        mailGenContent: accountVerificationEmailContent(updatedUser.alias, verificationUrl),
      });
      return { verificationUrl };
    },
    resetPassword: async function (token, pwd, pwdConfirm) {
      if (pwd !== pwdConfirm) throw getBadRequestError('Passwords do not match');
      const hashedToken = auth.createHashedToken(token);
      const user = await dao.findByForgotToken(hashedToken);
      const now = new Date();
      if (!user || !user.verificationExpires > now) throw getBadRequestError('Token is invalid or has expired');

      const hashedPwd = await auth.generatePasswordHash(pwd);
      const data = { forgotToken: '', forgotExpires: null, password: hashedPwd };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw getInternalError('Error updating user password');
    },
    sendPasswordResetEmail: async function (email, resetPath) {
      const user = await dao.findUserByEmail(email);
      if (!user) throw getNotFoundError(`Email ${email} is not registered`);
      const token = auth.generateTemporaryToken();
      const data = {
        forgotToken: token.hashedToken,
        forgotExpires: new Date(token.tokenExpiry),
      };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw getInternalError('Error generating tokens for user');

      const userObj = _getSanitizedUser(updatedUser);
      // Send passord reset email
      const resetUrl = `${resetPath}/${token.unhashedToken}`;
      mailer.sendMail({
        email: userObj.email,
        subject: 'Reset password',
        mailGenContent: forgotPasswordEmailContent(userObj.alias, resetUrl),
      });

      return {
        resetPasswordURL: resetUrl,
      };
    },
    signupUser: async function (userData, verificationPath) {
      const { alias, avatar, email, password } = userData;

      // verify that email not exist
      const user = await dao.findUserByEmail(email);
      if (user) throw getConflictError(`email ${email} is already registered`);

      // User does not exist
      // Create hashes, token and JWTs
      const hashedPwd = await auth.generatePasswordHash(password);
      const token = auth.generateTemporaryToken();

      // create new user
      const addedUser = await dao.addUser({
        alias,
        email,
        avatar,
        password: hashedPwd,
      });
      if (!addedUser) throw getInternalError('Error registering user');

      // Generate tokens
      const verificationToken = token.hashedToken;
      const verificationExpires = new Date(token.tokenExpiry);

      const accessToken = auth.generateAccessToken(addedUser);
      const refreshToken = auth.generateRefreshToken(addedUser.id);
      const data = {
        verificationToken,
        verificationExpires,
        refreshToken,
      };
      const updatedUser = await dao.updateUser(addedUser.id, data);
      if (!updatedUser) throw getInternalError('Error generating tokens for user');

      const userObj = _getSanitizedUser(updatedUser);

      // Send account verification email
      const verificationUrl = `${verificationPath}/${token.unhashedToken}`;
      mailer.sendMail({
        email: userObj.email,
        subject: 'Verify account',
        mailGenContent: accountVerificationEmailContent(userObj.alias, verificationUrl),
      });

      return {
        user: userObj,
        accessToken,
        refreshToken,
      };
    },

    listUsers: async function () {
      const data = await dao.queryUsers();
      return data;
    },

    verifyAccount: async function (token) {
      const now = new Date();
      const hashedToken = auth.createHashedToken(token);
      const user = await dao.findByVerificationToken(hashedToken);
      if (!user || user.verificationExpires < now) return false;

      const updatedUser = await dao.updateUser(user.id, { verified: true });
      if (!updatedUser) return false;

      return true;
    },
  };
}
