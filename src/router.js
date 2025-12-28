import express from 'express';

import { asyncHandler } from './middleware/async.handler.js';
import { ApiResponse } from './utils/api.response.js';

export function getRouter(cnf, log) {
  const routeGroups = [
    {
      group: { prefix: '', middleware: [] },
      routes: [
        {
          method: 'get',
          path: '/ping',
          middleware: [],
          handler: asyncHandler(async (req, res) => {
            res
              .status(200)
              .json(new ApiResponse(200, { message: 'Pong' }, 'Status OK'));
          }),
        },
      ],
    },
  ];
  const router = express.Router();

  routeGroups.forEach(({ group, routes }) => {
    routes.forEach(({ method, path, middleware = [], handler }) => {
      log.info(`Route: ${method} ${group.prefix}${path}`);
      router[method](
        group.prefix + path,
        [...(group.middleware || []), ...middleware],
        handler,
      );
    });
  });

  return router;
}
