import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { getConfig } from '../utils/config.js';

const cnf = getConfig();

const client = postgres(cnf.dbUrl, {
  max: 10, // Adjust pool size based on your needs
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle({ client });

export default db;
