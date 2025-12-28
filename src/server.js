import { createServer } from 'node:http';

import { getConfig } from './utils/config.js';
import { getLogger } from './utils/logger.js';
import { getApp } from './app.js';

export async function startServer() {
  const cnf = getConfig();
  const log = getLogger(cnf);

  process.on('uncaughtException', async (err) => {
    log.fatal(err, `Uncaught exception: ${err.message}`);
    throw err;
  });

  process.on('unhandledRejection', async (reason, p) => {
    log.fatal(p, `Uhandled promise rejection: Reason: ${reason}`);
    process.exitCode = 1;
  });

  process.on('SIGINT', async () => {
    log.info('SIGINT received, shutting down...');
    process.exitCode = 0;
  });

  log.info('Starting http server');
  const app = getApp(cnf, log);
  const server = createServer(app);
  server.listen(cnf.port, () => {
    log.info(`HTTP server running on port ${cnf.port}`);
  });

  return server;
}
