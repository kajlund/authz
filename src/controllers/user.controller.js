import { ApiResponse } from '../utils/api.response.js';
import { asyncHandler } from '../middleware/async.handler.js';
import { getUserServices } from '../services/user.services.js';
import { codes } from '../utils/status.js';

export function getUserController(cnf, log) {
  const svcUser = getUserServices(cnf, log);

  return {
    createUser: asyncHandler(async (req, res) => {
      const { payload } = req.locals;
      const user = await svcUser.createUser(payload);
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, user, 'Created user'));
    }),
    deleteUser: asyncHandler(async (req, res) => {
      const { id } = req.locals;
      const deleted = await svcUser.deleteUser(id);
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, deleted, 'Deleted user'));
    }),
    findUserById: asyncHandler(async (req, res) => {
      const { id } = req.locals;
      const user = await svcUser.findUserById(id);
      res.status(codes.OK).json(new ApiResponse(codes.OK, user, 'Found user'));
    }),
    getUserList: asyncHandler(async (req, res) => {
      const users = await svcUser.getUserList();
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, users, 'Found users'));
    }),
    updateUser: asyncHandler(async (req, res) => {
      const { id, payload } = req.locals;
      const updated = await svcUser.updateUser(id, payload);
      res
        .status(codes.OK)
        .json(new ApiResponse(codes.OK, updated, `Update user with id: ${id}`));
    }),
  };
}
