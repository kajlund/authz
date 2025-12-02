import express from 'express';

import { healthCheck } from './controllers/healthcheck.controller.js';
import { getAuthMiddleware } from './middleware/auth.middleware.js';
import { getAuthController } from './controllers/auth.controller.js';
import { getUserController } from './controllers/user.controller.js';
import { validateBody, validateIdParam, validateTokenParam } from './middleware/validation.middleware.js';
import { changePasswordSchema, loginSchema, resetPasswordSchema } from './schemas/auth.schemas.js';
import { newUserSchema } from './schemas/user.schemas.js';

export function getRouter(cnf, log) {
  const ctrlAuth = getAuthController(cnf, log);
  const ctrlUser = getUserController(cnf, log);
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
          method: 'post',
          path: '/changepassword',
          middleware: [isAuthenticated, validateBody(changePasswordSchema)],
          handler: ctrlAuth.changePassword,
        },
        {
          method: 'get',
          path: '/me',
          middleware: [isAuthenticated],
          handler: ctrlAuth.getCurrentUser,
        },
        {
          method: 'post',
          path: '/login',
          middleware: [validateBody(loginSchema)],
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
          middleware: [validateBody(newUserSchema)],
          handler: ctrlAuth.register,
        },
        {
          method: 'post',
          path: '/requestpwdchange',
          middleware: [],
          handler: ctrlAuth.sendPasswordResetMail,
        },
        {
          method: 'post',
          path: '/resetpassword/:token',
          middleware: [validateTokenParam, validateBody(resetPasswordSchema)],
          handler: ctrlAuth.resetPassword,
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
          middleware: [validateTokenParam],
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
          handler: ctrlUser.queryUsers,
        },
        {
          method: 'delete',
          path: '/:id',
          middleware: [isAuthenticated, requireAdmin, validateIdParam],
          handler: ctrlUser.deleteUser,
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
