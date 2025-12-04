import { NotImplementedError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';
import { getUserServices } from '../services/user.services.js';
import { codes } from '../utils/status.js';

export function getUserController(cnf, log) {
  const svcUser = getUserServices(cnf, log);

  return {
    deleteUser: asyncHandler((req) => {
      const { id } = req.locals;
      throw new NotImplementedError(
        `Delete user with id ${id} has not been implemented yet`,
      );
    }),
    queryUsers: asyncHandler(async (req, res) => {
      const users = await svcUser.listUsers();
      res.status(codes.OK).json({
        success: true,
        status: codes.OK,
        message: 'Uses list',
        users,
      });
    }),
  };
}
