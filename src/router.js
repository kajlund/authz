import express from 'express';

import { asyncHandler } from './middleware/async.handler.js';
import { ApiResponse } from './utils/api.response.js';
// import { getAuthMiddleware } from './middleware/auth.middleware.js';
import { getUserController } from './controllers/user.controller.js';
import {
  userSchema,
  validateBody,
  validateIdParam,
} from './middleware/validation.middleware.js';

export function getRouter(cnf, log) {
  // const { isAuthenticated, checkRole } = getAuthMiddleware(cnf, log);
  // const requireAdmin = checkRole('ADMIN');
  const ctrlUser = getUserController(cnf, log);
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
    {
      group: {
        prefix: '/api/v1/users',
        middleware: [],
      },
      routes: [
        {
          method: 'get',
          path: '/',
          middleware: [], //isAuthenticated, requireAdmin
          handler: ctrlUser.getUserList,
        },
        {
          method: 'get',
          path: '/:id',
          middleware: [validateIdParam], //isAuthenticated, requireAdmin
          handler: ctrlUser.findUserById,
        },
        {
          method: 'post',
          path: '/',
          middleware: [validateBody(userSchema)], //isAuthenticated, requireAdmin
          handler: ctrlUser.createUser,
        },
        {
          method: 'put',
          path: '/:id',
          middleware: [validateIdParam, validateBody(userSchema)], //isAuthenticated, requireAdmin
          handler: ctrlUser.updateUser,
        },
        {
          method: 'delete',
          path: '/:id',
          middleware: [validateIdParam], // isAuthenticated, requireAdmin,
          handler: ctrlUser.deleteUser,
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
