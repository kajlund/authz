/* eslint-disable no-unused-vars */
import { z } from 'zod';

import { codes, phrases } from './utils/status.js';
import { getUserServices } from './services/user.services.js';
import { loginPayloadSchema, signupPayloadSchema } from './utils/validators.js';
import { BadRequestError } from './utils/errors.js';

export function getHandlers(log) {
  const svcUser = getUserServices(log);
  return {
    deleteUser,
    getCurrentUser: function (req, res, next) {
      try {
        res.status(codes.OK).json({
          success: true,
          status: codes.OK,
          message: 'Your details',
          data: req.user,
        });
      } catch (err) {
        next(err);
      }
    },
    loginUser: async function (req, res, next) {
      try {
        const vld = loginPayloadSchema.safeParse(req.body);
        if (!vld.success) throw new BadRequestError(z.prettifyError(vld.error));
        const session = await svcUser.loginUser(vld.data);
        res.status(codes.OK).json({
          success: true,
          status: codes.OK,
          message: 'User logged in',
          data: session,
        });
      } catch (err) {
        next(err);
      }
    },
    logoutUser,
    signupUser: async function (req, res, next) {
      try {
        const vld = signupPayloadSchema.safeParse(req.body);
        if (!vld.success) throw new BadRequestError(z.prettifyError(vld.error));

        const newUser = await svcUser.signupUser(vld.data);

        res.status(codes.OK).json({
          success: true,
          status: codes.OK,
          message: 'User registered',
          data: newUser,
        });
      } catch (err) {
        next(err);
      }
    },
  };
}

function deleteUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function getCurrentUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function logoutUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}
