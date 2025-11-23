import pino from 'pino';

export function getLogger(cnf) {
  const logConfig = { level: cnf.logLevel };
  if (cnf.isDev) {
    logConfig.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    };
  }
  return pino(logConfig);
}
