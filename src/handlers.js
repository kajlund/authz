/* eslint-disable no-unused-vars */
import { z } from 'zod';

import { codes, phrases } from './utils/status.js';
import { getUserServices } from './services/user.services.js';

export function getHandlers(cnf, log) {
  const svcUser = getUserServices(cnf, log);
  return {
    deleteUser,
    getAllUsers: async function (req, res, next) {
      try {
        const users = await svcUser.listUsers();
        res.status(codes.OK).json({
          success: true,
          status: codes.OK,
          message: 'Uses list',
          users,
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
