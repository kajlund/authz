import express from 'express';

import { getHandlers } from './handlers.js';

export function getRouter(log) {
  const hnd = getHandlers(log);

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
          path: '/me',
          middleware: [],
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
          middleware: [],
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
