import { z } from 'zod';

const configSchema = z.strictObject({
  env: z.enum(['development', 'production', 'test']).optional(),
  port: z.number().int().positive().gte(80).lte(65000),
  logLevel: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .optional(),
  logHttp: z.boolean().optional(),
  dbConnection: z.string().trim(),
  saltRounds: z.number().int().positive().gte(10).lte(20),
  corsOrigin: z.array(z.string()).optional(),
  accessTokenSecret: z.string().min(30),
  accessTokenExpiry: z.string(),
  refreshTokenSecret: z.string().min(30),
  refreshTokenExpiry: z.string(),
  smtpHost: z.string(),
  smtpPort: z.number().int().positive(),
  smtpUser: z.string(),
  smtpPass: z.string(),
});

function getDefaultConfig() {
  return {
    env: process.env.NODE_ENV || 'production',
    port: parseInt(process.env.PORT),
    logLevel: process.env.LOG_LEVEL || 'info',
    logHttp: process.env.LOG_HTTP === '1',
    dbConnection: process.env.DB_CONNECTION,
    saltRounds: parseInt(process.env.SALT_ROUNDS),
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
    ],
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  };
}

export function getConfig(config = {}) {
  const cnf = { ...getDefaultConfig(), ...config };
  configSchema.parse(cnf);
  cnf.isDev = cnf.env === 'development';

  return cnf;
}
