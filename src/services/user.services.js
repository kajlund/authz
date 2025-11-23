import { randomBytes, createHmac } from 'node:crypto';

import { eq } from 'drizzle-orm';

import db from '../db/index.js';
import { usersTable } from '../db/schemas.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { getSessionServices } from './session.services.js';

function getDAO(log) {
  return {
    addUser: async function (data) {
      const [newUser] = await db.insert(usersTable).values(data).returning();
      log.debug(newUser, 'Created user');
      return newUser;
    },
    findUserByEmail: async function (email) {
      const [found] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
      return found;
    },
  };
}

export function getUserServices(log) {
  const dao = getDAO(log);
  const svcSession = getSessionServices(log);

  return {
    loginUser: async function (loginData) {
      const { email, password } = loginData;
      // verify that user exists
      const user = await dao.findUserByEmail(email);
      if (!user) throw new UnauthorizedError('Invalid credentials');
      // Verify pwd
      const newHash = createHmac('sha256', user.salt).update(password).digest('hex');
      if (newHash !== user.password) throw new UnauthorizedError('Invalid credentials');
      // Password matched. Create session
      const session = await svcSession.createUserSession(user);

      return session;
    },

    signupUser: async function (userData) {
      const { alias, email, password } = userData;
      // verify that email not exist
      const user = await dao.findUserByEmail(email);
      if (user) throw new BadRequestError(`email ${email} is already registered`);
      // User does not exist create new
      const salt = randomBytes(256).toString('hex');
      const hashedPwd = createHmac('sha256', salt).update(password).digest('hex');
      const addedUser = await dao.addUser({ alias, email, password: hashedPwd, salt });
      return {
        id: addedUser.id,
        alias: addedUser.alias,
        email: addedUser.email,
      };
    },
  };
}
