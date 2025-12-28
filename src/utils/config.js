import { z } from 'zod';

const configSchema = z.strictObject({
  env: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('production'),
  port: z.coerce
    .number()
    .int()
    .positive()
    .gte(80)
    .lte(65000)
    .optional()
    .default(3005),
  logLevel: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .optional()
    .default('info'),
  logHttp: z.coerce.boolean().optional().default(false),
  dbUrl: z.string().trim(),
  dbAuthToken: z.string().trim(),
  saltRounds: z.coerce.number().int().positive().gte(10).lte(20),
  corsOrigin: z.array(z.string()).optional().default(['http://localhost:3005']),
  accessTokenSecret: z.string().min(30),
  accessTokenExpiry: z.string().optional().default('1min'),
  refreshTokenSecret: z.string().min(30),
  refreshTokenExpiry: z.string().optional().default('1min'),
  smtpHost: z.string(),
  smtpPort: z.coerce.number().int().positive(),
  smtpUser: z.string(),
  smtpPass: z.string(),
});

function getEnvConfig() {
  return {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    logHttp: process.env.LOG_HTTP,
    dbUrl: process.env.TURSO_DATABASE_URL,
    dbAuthToken: process.env.TURSO_AUTH_TOKEN,
    saltRounds: process.env.SALT_ROUNDS,
    corsOrigin: process.env.CORS_ORIGIN?.split(','),
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  };
}

export function getConfig(config = {}) {
  const candidate = { ...getEnvConfig(), ...config };
  const result = configSchema.safeParse(candidate);
  if (!result.success) {
    console.log(result.error);
    throw new Error('Configuration faulty');
  }
  const cnf = { ...result.data, isDev: result.data.env === 'development' };
  return cnf;
}
