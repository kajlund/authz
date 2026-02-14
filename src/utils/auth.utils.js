import { createHash, randomBytes } from 'crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const getGravatarUrl = (email) => {
  const hash = createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');
  // d=mp (Mystery Person) or d=identicon provides a
  // default if the email has no Gravatar
  return `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
};

export function getAuthUtils(cnf, log) {
  return {
    getGravatarUrl,
    comparePasswords: async (pwd, hash) => {
      return await bcrypt.compare(pwd, hash);
    },
    createHashedToken: (token) => {
      const hashedToken = createHash('sha256').update(token).digest('hex');
      return hashedToken;
    },
    generateAccessToken: (user) => {
      const payload = {
        id: user.id,
        alias: user.alias,
        email: user.email,
        avatar: user.avatar || getGravatarUrl(user.email),
        role: user.role,
      };
      const token = jwt.sign(payload, cnf.accessTokenSecret, {
        expiresIn: cnf.accessTokenExpiry,
      });
      return token;
    },
    generatePasswordHash: async (pwd) => {
      const hash = await bcrypt.hash(pwd, cnf.saltRounds);

      return hash;
    },
    generateRefreshToken: (userId) => {
      const payload = {
        id: userId,
      };
      const token = jwt.sign(payload, cnf.refreshTokenSecret, {
        expiresIn: cnf.refreshTokenExpiry,
      });
      return token;
    },
    generateTemporaryToken: () => {
      const unhashedToken = randomBytes(32).toString('hex');
      const hashedToken = createHash('sha256')
        .update(unhashedToken)
        .digest('hex');

      const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 min

      return {
        unhashedToken,
        hashedToken,
        tokenExpiry,
      };
    },
    verifyAccessToken: (token) => {
      try {
        const decoded = jwt.verify(token, cnf.accessTokenSecret);
        return decoded;
      } catch (err) {
        log.error(err);
        return null;
      }
    },
    verifyRefreshToken: (token) => {
      try {
        const decoded = jwt.decode(token, cnf.refreshTokenSecret);
        return decoded;
      } catch (err) {
        log.error(err);
        return null;
      }
    },
  };
}
