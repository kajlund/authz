import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

import db from '../db/index.js';
import { sessionsTable, usersTable } from '../db/schemas.js';

function getDAO(log) {
  return {
    addSession: async function (data) {
      const [newSession] = await db.insert(sessionsTable).values(data).returning();
      log.debug(newSession, 'Created session');
      return newSession;
    },
    findSessionById: async function (id) {
      const [found] = await db.select().from(sessionsTable).where(eq(sessionsTable.id, id)).limit(1);
      return found;
    },
  };
}

export function getSessionServices(cnf, log) {
  const dao = getDAO(log);

  return {
    createJWT: function (user) {
      const payload = {
        id: user.id,
        alias: user.alias,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, cnf.jwtSecret, { expiresIn: '24h' });
      return token;
    },
    verifyJWT: function (token) {
      try {
        const decoded = jwt.decode(token, cnf.jwtSecret);
        return decoded;
      } catch (err) {
        log.error(err);
        return null;
      }
    },
    createSession: async function (user) {
      const session = await dao.addSession({ userId: user.id });
      return session;
    },
    checkSession: async function (sessionId) {
      let userInfo = null;
      const session = await dao.findSessionById(sessionId);
      if (session) {
        const [data] = await db
          .select({
            id: sessionsTable.id,
            userId: sessionsTable.userId,
            alias: usersTable.alias,
            email: usersTable.email,
            role: usersTable.role,
          })
          .from(sessionsTable)
          .rightJoin(usersTable, eq(usersTable.id, sessionsTable.userId))
          .where(eq(sessionsTable.id, sessionId));

        if (data) {
          userInfo = {
            sessionId: data.id,
            userId: data.userId,
            alias: data.alias,
            email: data.email,
            role: data.role,
          };
        }
      }
      return userInfo;
    },
  };
}
