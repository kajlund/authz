import express from 'express';

import { getHandlers } from './handlers.js';
import { healthCheck } from './controllers/healthcheck.controller.js';
import { getAuthMiddleware } from './middleware/auth.middleware.js';
import { getAuthController } from './controllers/auth.controller.js';

export function getRouter(cnf, log) {
  const hnd = getHandlers(cnf, log);
  const ctrlAuth = getAuthController(cnf, log);
  const { isAuthenticated, checkRole } = getAuthMiddleware(cnf, log);
  const requireAdmin = checkRole('ADMIN');

  const routeGroups = [
    {
      group: { prefix: '', middleware: [] },
      routes: [
        {
          method: 'get',
          path: '/ping',
          middleware: [],
          handler: healthCheck,
        },
      ],
    },
    {
      group: {
        prefix: '/api/v1/auth',
        middleware: [],
      },
      routes: [
        {
          method: 'get',
          path: '/me',
          middleware: [isAuthenticated],
          handler: ctrlAuth.getCurrentUser,
        },
        {
          method: 'post',
          path: '/login',
          middleware: [],
          handler: ctrlAuth.login,
        },
        {
          method: 'get',
          path: '/logout',
          middleware: [isAuthenticated],
          handler: ctrlAuth.logout,
        },
        {
          method: 'post',
          path: '/refresh',
          middleware: [isAuthenticated],
          handler: ctrlAuth.refreshAccessToken,
        },
        {
          method: 'post',
          path: '/register',
          middleware: [],
          handler: ctrlAuth.register,
        },
        {
          method: 'get',
          path: '/resend-verification',
          middleware: [isAuthenticated],
          handler: ctrlAuth.resendVerifyEmail,
        },
        {
          method: 'get',
          path: '/verify/:token',
          middleware: [],
          handler: ctrlAuth.verifyEmail,
        },
      ],
    },
    {
      group: {
        prefix: '/api/v1/users',
        middleware: [],
      },
      routes: [
        {
          method: 'get',
          path: '/',
          middleware: [isAuthenticated, requireAdmin],
          handler: hnd.getAllUsers,
        },
        {
          method: 'delete',
          path: '/:id',
          middleware: [isAuthenticated, requireAdmin],
          handler: hnd.deleteUser,
        },
      ],
    },
  ];
  const router = express.Router();

  routeGroups.forEach(({ group, routes }) => {
    routes.forEach(({ method, path, middleware = [], handler }) => {
      log.info(`Route: ${method} ${group.prefix}${path}`);
      router[method](group.prefix + path, [...(group.middleware || []), ...middleware], handler);
    });
  });

  return router;
}
