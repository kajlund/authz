import express from 'express';

import { getHandlers } from './handlers.js';
import { getAuthHandlers } from './middleware/auth.js';

export function getRouter(cnf, log) {
  const hnd = getHandlers(cnf, log);
  const { isAuthenticated, checkRole } = getAuthHandlers(cnf, log);
  const requireAdmin = checkRole('ADMIN');

  const routeGroups = [
    {
      group: { prefix: '', middleware: [] },
      routes: [
        {
          method: 'get',
          path: '/ping',
          middleware: [],
          handler: (_req, res) => res.status(200).send('pong'),
        },
      ],
    },
    {
      group: {
        prefix: '/users',
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
          method: 'get',
          path: '/me',
          middleware: [isAuthenticated],
          handler: hnd.getCurrentUser,
        },
        {
          method: 'post',
          path: '/logout',
          middleware: [],
          handler: hnd.logoutUser,
        },
        {
          method: 'post',
          path: '/login',
          middleware: [],
          handler: hnd.loginUser,
        },
        {
          method: 'post',
          path: '/signup',
          middleware: [],
          handler: hnd.signupUser,
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
