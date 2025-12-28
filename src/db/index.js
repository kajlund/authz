import { drizzle } from 'drizzle-orm/libsql/node';
import { createClient } from '@libsql/client';

import { getConfig } from '../utils/config.js';

const cnf = getConfig();

const client = createClient({
  url: cnf.dbUrl,
  authToken: cnf.dbAuthToken,
});

const db = drizzle({ client });

export default db;
