import { drizzle } from 'drizzle-orm/node-postgres';
import { getConfig } from '../utils/config.js';

const cnf = getConfig();

const db = drizzle(cnf.dbConnection);

export default db;
