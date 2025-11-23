import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
// import getConfig from './src/config.js';

// const cnf = getConfig();

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schemas.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_CONNECTION, //cnf.dbConnection,
  },
});
