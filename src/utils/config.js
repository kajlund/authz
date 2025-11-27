import { z } from 'zod';

const configSchema = z.strictObject({
  env: z.enum(['development', 'production', 'test']).optional(),
  port: z.number().int().positive().gte(80).lte(65000),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).optional(),
  logHttp: z.boolean().optional(),
  dbConnection: z.string().trim(),
  saltRounds: z.number().int().positive().gte(10).lte(20),
  jwtSecret: z.string().min(30),
  corsOrigin: z.array(z.string()).optional(),
});

function getDefaultConfig() {
  return {
    env: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT),
    logLevel: process.env.LOG_LEVEL || 'info',
    logHttp: process.env.LOG_HTTP === '1',
    dbConnection: process.env.DB_CONNECTION,
    saltRounds: parseInt(process.env.SALT_ROUNDS),
    jwtSecret: process.env.JWT_SECRET,
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  };
}

export function getConfig(config = {}) {
  const cnf = { ...getDefaultConfig(), ...config };
  configSchema.parse(cnf);
  cnf.isDev = cnf.env === 'development';

  return cnf;
}
