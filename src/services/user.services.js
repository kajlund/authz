import { getAuthUtils } from '../utils/auth.utils.js';
import { getMailer, accountVerificationEmailContent } from '../utils/emailer.js';
import { getConflictError, getInternalError, getUnauthorizedError } from '../utils/api-error.js';
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
      if (!auth.comparePasswords(foundUser.password, password)) throw getUnauthorizedError('Invalid credentials');

      // Password matched. Create session
      const accessToken = auth.generateAccessToken(foundUser);
      const refreshToken = auth.generateRefreshToken(foundUser.id);

      const user = _getSanitizedUser(foundUser);

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
    signupUser: async function (userData, verificationPath) {
      const { alias, avatar, email, password } = userData;

      // verify that email not exist
      const user = await dao.findUserByEmail(email);
      if (user) throw new getConflictError(`email ${email} is already registered`);

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
      const verificationUrl = `${verificationPath}/${verificationToken}`;
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
  };
}
