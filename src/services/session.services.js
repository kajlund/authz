import { eq } from 'drizzle-orm';

import db from '../db/index.js';
import { sessionsTable } from '../db/schemas.js';

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
    createUserSession: async function (user) {
      const session = await dao.addSession({ userId: user.id });
      return session;
    },
  };
}
