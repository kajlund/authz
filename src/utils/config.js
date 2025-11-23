import { z } from 'zod';

const configSchema = z.strictObject({
  env: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().int().positive().gte(80).lte(65000).default(3000),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('info'),
  logHttp: z.boolean().default(false),
  dbConnection: z.string().trim(),
  saltRounds: z.number().int().positive().gte(10).lte(20),
});

function getDefaultConfig() {
  return {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT),
    logLevel: process.env.LOG_LEVEL,
    logHttp: process.env.LOG_HTTP === '1',
    dbConnection: process.env.DB_CONNECTION,
    saltRounds: parseInt(process.env.SALT_ROUNDS),
  };
}

export function getConfig(config = {}) {
  const cnf = { ...getDefaultConfig(), ...config };
  const vld = configSchema.safeParse(cnf);

  if (!vld.success) throw new Error(`Configuration validation error: ${z.prettifyError(vld.error)}`);

  cnf.isDev = cnf.env === 'development';

  return cnf;
}
