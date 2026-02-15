import express from 'express';

import { asyncHandler } from './middleware/async.handler.js';
import { ApiResponse } from './utils/api.response.js';
import { getAuthController } from './controllers/auth.controller.js';
import { getAuthMiddleware } from './middleware/auth.middleware.js';
import { getUserController } from './controllers/user.controller.js';
import {
  loginSchema,
  profileSchema,
  userSchema,
  validateBody,
  validateIdParam,
} from './middleware/validation.middleware.js';

export function getRouter(cnf, log) {
  const { isAuthenticated, checkRole } = getAuthMiddleware(cnf, log);
  const requireAdmin = checkRole('ADMIN');
  const ctrlAuth = getAuthController(cnf, log);
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
        prefix: '/users',
        middleware: [isAuthenticated, requireAdmin],
      },
      routes: [
        {
          method: 'get',
          path: '/',
          middleware: [],
          handler: ctrlUser.getUserList,
        },
        {
          method: 'get',
          path: '/:id',
          middleware: [validateIdParam],
          handler: ctrlUser.findUserById,
        },
        {
          method: 'post',
          path: '/',
          middleware: [validateBody(userSchema)],
          handler: ctrlUser.createUser,
        },
        {
          method: 'put',
          path: '/:id',
          middleware: [validateIdParam, validateBody(userSchema)],
          handler: ctrlUser.updateUser,
        },
        {
          method: 'delete',
          path: '/:id',
          middleware: [validateIdParam],
          handler: ctrlUser.deleteUser,
        },
      ],
    },
    {
      group: {
        prefix: '/auth',
        middleware: [],
      },
      routes: [
        {
          method: 'post',
          path: '/login',
          middleware: [validateBody(loginSchema)],
          handler: ctrlAuth.loginUser,
        },
        {
          method: 'get',
          path: '/logout',
          middleware: [isAuthenticated],
          handler: ctrlAuth.logoutUser,
        },
        {
          method: 'get',
          path: '/me',
          middleware: [isAuthenticated],
          handler: ctrlAuth.getCurrentUser,
        },
        {
          method: 'put',
          path: '/me/:id',
          middleware: [
            isAuthenticated,
            validateIdParam,
            validateBody(profileSchema),
          ],
          handler: ctrlAuth.updateCurrentUser,
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
