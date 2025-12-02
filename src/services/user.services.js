import { getAuthUtils } from '../utils/auth.utils.js';
import { getMailer, accountVerificationEmailContent, forgotPasswordEmailContent } from '../utils/emailer.js';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/api-error.js';
import { getUserDAO } from '../db/user.dao.js';

function _getSanitizedUser(user) {
  const { id, alias, email, avatar, role, createdAt, updatedAt } = user;
  return { id, alias, email, avatar, role, createdAt, updatedAt };
}

export function getUserServices(cnf, log) {
  const dao = getUserDAO(log);
  const auth = getAuthUtils(cnf, log);
  const mailer = getMailer(cnf, log);

  return {
    changePassword: async (id, oldPwd, pwd, confirm) => {
      if (pwd !== confirm) throw new BadRequestError('Passwords do not match');
      const found = await dao.findUserById(id);
      if (!found) throw new NotFoundError('User not found trying to change password');

      // Verify old pwd
      const pwdOK = await auth.comparePasswords(oldPwd, found.password);
      if (!pwdOK) throw new BadRequestError('Old password incorrect');

      // Hash new pwd and update
      const hashedPwd = await auth.generatePasswordHash(pwd);
      const updatedUser = await dao.updateUser(found.id, { password: hashedPwd });
      if (!updatedUser) throw new InternalServerError('Error updating user password');
    },
    findUserById: async (id) => {
      const found = await dao.findUserById(id);
      if (!found) throw new NotFoundError(`User with id ${id} was not found`);
      return _getSanitizedUser(found);
    },
    loginUser: async (loginData) => {
      const { email, password } = loginData;
      // verify that user exists
      const foundUser = await dao.findUserByEmail(email);
      if (!foundUser) throw new UnauthorizedError('Invalid credentials');
      // Verify pwd
      const pwdOK = await auth.comparePasswords(password, foundUser.password);
      if (!pwdOK) throw new UnauthorizedError('Invalid credentials');

      // Password matched. Create session
      const accessToken = auth.generateAccessToken(foundUser);
      const refreshToken = auth.generateRefreshToken(foundUser.id);
      // Update user refresh token
      const updatedUser = await dao.updateUser(foundUser.id, { refreshToken });
      if (!updatedUser) throw new InternalServerError('Error updating user on login');

      const user = _getSanitizedUser(updatedUser);

      return {
        user,
        accessToken,
        refreshToken,
      };
    },
    logoutUser: async (userId) => {
      const updatedUser = await dao.updateUser(userId, { refreshToken: '' });
      if (!updatedUser) throw new InternalServerError('Failed updating user data on logout');
      return _getSanitizedUser(updatedUser);
    },
    refreshAccessToken: async (token) => {
      if (!token) throw new UnauthorizedError('Invalid token');
      // Validate refresh token
      const incomingRefreshToken = auth.verifyRefreshToken(token);
      if (!incomingRefreshToken) throw new UnauthorizedError('Invalid refresh token on trying to refresh access token');

      const user = await dao.findUserById(incomingRefreshToken.id);
      if (!user) throw UnauthorizedError('Invalid user trying to refresh access token');

      if (token !== user.refreshToken)
        throw new UnauthorizedError('Refresh token has expired on trying to refresh access token');

      const accessToken = auth.generateAccessToken(user);
      const refreshToken = auth.generateRefreshToken(user.id);
      const updatedUser = await dao.updateUser(user.id, { refreshToken });
      if (!updatedUser) throw new InternalServerError('FAiled updating user info trying to refresh access token');

      const userObj = _getSanitizedUser(updatedUser);

      return {
        user: userObj,
        accessToken,
        refreshToken,
      };
    },
    resendVerification: async (userId, verificationPath) => {
      const user = await dao.findUserById(userId);
      if (!user) throw new NotFoundError('User not found');
      if (user.verified) throw new ConflictError(`User ${user.alias} is already verified`);
      // Create new temp token
      const token = auth.generateTemporaryToken();
      const data = {
        verificationToken: token.hashedToken,
        verificationExpires: new Date(token.tokenExpiry),
      };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw new InternalServerError('Error updating user on resending verification email');

      // Send account verification email
      const verificationUrl = `${verificationPath}/${token.unhashedToken}`;
      try {
        mailer.sendMail({
          verificationUrl: updatedUser.email,
          subject: 'Verify account',
          mailGenContent: accountVerificationEmailContent(updatedUser.alias, verificationUrl),
        });
      } catch (err) {
        log.error(err, 'Sending email failed');
        throw new InternalServerError('Error resending verification email');
      }

      return { verificationUrl };
    },
    resetPassword: async (token, pwd, pwdConfirm) => {
      if (pwd !== pwdConfirm) throw new BadRequestError('Passwords do not match');
      const hashedToken = auth.createHashedToken(token);
      const user = await dao.findByForgotToken(hashedToken);
      const now = new Date();
      if (!user || !user.verificationExpires > now) throw new BadRequestError('Token is invalid or has expired');

      const hashedPwd = await auth.generatePasswordHash(pwd);
      const data = { forgotToken: '', forgotExpires: null, password: hashedPwd };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw new InternalServerError('Error updating user trying to reset password');
    },
    sendPasswordResetEmail: async (email, resetPath) => {
      const user = await dao.findUserByEmail(email);
      if (!user) throw new NotFoundError(`Email ${email} not found trying to send reset email`);
      const token = auth.generateTemporaryToken();
      const data = {
        forgotToken: token.hashedToken,
        forgotExpires: new Date(token.tokenExpiry),
      };
      const updatedUser = await dao.updateUser(user.id, data);
      if (!updatedUser) throw new InternalServerError('Error udating user trying to send reset email');

      const userObj = _getSanitizedUser(updatedUser);
      // Send passord reset email
      const resetUrl = `${resetPath}/${token.unhashedToken}`;
      try {
        mailer.sendMail({
          email: userObj.email,
          subject: 'Reset password',
          mailGenContent: forgotPasswordEmailContent(userObj.alias, resetUrl),
        });
      } catch (err) {
        log.error(err, 'Sending email failed');
        throw new InternalServerError('Error sending password reset email');
      }

      return {
        resetPasswordURL: resetUrl,
      };
    },
    signupUser: async (userData, verificationPath) => {
      const { alias, avatar, email, password } = userData;

      // verify that email not exist
      const user = await dao.findUserByEmail(email);
      if (user) throw new ConflictError(`Email ${email} is already registered`);

      // User does not exist
      // Create hashes, token and JWTs
      const hashedPwd = await auth.generatePasswordHash(password);
      const token = auth.generateTemporaryToken();

      // Create new user
      const addedUser = await dao.addUser({
        alias,
        email,
        avatar,
        password: hashedPwd,
      });
      if (!addedUser) throw new InternalServerError('Error saving user on signup');

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
      if (!updatedUser) throw new InternalServerError('Error updating user on signup');

      const userObj = _getSanitizedUser(updatedUser);

      // Send account verification email
      const verificationUrl = `${verificationPath}/${token.unhashedToken}`;
      try {
        mailer.sendMail({
          email: userObj.email,
          subject: 'Verify account',
          mailGenContent: accountVerificationEmailContent(userObj.alias, verificationUrl),
        });
      } catch (err) {
        log.error(err, 'Sending email failed');
        throw new InternalServerError('Error sending account verification email');
      }

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

    verifyAccount: async (token) => {
      const now = new Date();
      if (!token) throw new BadRequestError('Email verification token is missing');
      const hashedToken = auth.createHashedToken(token);
      const user = await dao.findByVerificationToken(hashedToken);
      if (!user || user.verificationExpires < now) throw new BadRequestError('Token is invalid or has expired');

      const updatedUser = await dao.updateUser(user.id, {
        verified: true,
        verificationToken: '',
        verificationExpires: null,
      });
      if (!updatedUser) throw new InternalServerError('Error updating user verifying account');

      return _getSanitizedUser(updatedUser);
    },
  };
}
