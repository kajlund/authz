import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import httpLogger from 'pino-http';

import { getRouter } from './router.js';
import { getErrorHandler } from './middleware/error.handler.js';
import { getNotFoundHandler } from './middleware/notfound.handler.js';

export function getApp(cnf, log) {
  const app = express();

  // Add middleware
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // trust first proxy
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: cnf.corsOrigin,
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
      exposedHeaders: ['set-cookie'],
    }),
  );
  app.use(express.static('public'));

  // Logging Middleware
  if (cnf.logHttp) {
    app.use(httpLogger({ logger: log }));
  }

  // Add routes
  app.use(getRouter(cnf, log));

  // Add 404 handler
  app.use(getNotFoundHandler());

  // Add Generic Error handler
  app.use(getErrorHandler(log));

  return app;
}
