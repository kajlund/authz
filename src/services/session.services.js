import { eq } from 'drizzle-orm';

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

export function getSessionServices(log) {
  const dao = getDAO(log);

  return {
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
          };
        }
      }
      return userInfo;
    },
  };
}
