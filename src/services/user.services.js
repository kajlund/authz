import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../utils/api.error.js';
import { getUserDAO } from '../db/user.dao.js';
import { getAuthUtils } from '../utils/auth.utils.js';

function _sanitizeUser(user) {
  const { id, alias, email, avatar, role, createdAt, updatedAt } = user;
  return { id, alias, email, avatar, role, createdAt, updatedAt };
}

export const getUserServices = (cnf, log) => {
  const authUtils = getAuthUtils(cnf, log);
  const dao = getUserDAO(log);

  return {
    createUser: async (payload) => {
      // verify that email not exist
      const user = await dao.findUserByEmail(payload.email);
      if (user)
        throw new ConflictError(`Email ${payload.email} is already registered`);

      payload.password = await authUtils.generatePasswordHash(payload.password);

      const created = await dao.createUser(payload);
      if (!created) throw new InternalServerError('Failed creating user');
      return _sanitizeUser(created);
    },
    deleteUser: async (id) => {
      const deleted = await dao.deleteUser(id);
      if (!deleted)
        throw new InternalServerError(`Failed deleting user with id ${id}`);
      return _sanitizeUser(deleted);
    },
    findUserById: async (id) => {
      const found = await dao.findUserById(id);
      if (!found) throw new NotFoundError(`User with id ${id} was not found`);
      return _sanitizeUser(found);
    },
    getUserList: async () => {
      const data = await dao.queryUsers();
      return data;
    },
    updateUser: async (id, payload) => {
      const updated = await dao.updateUser(id, payload);
      if (!updated)
        throw new InternalServerError(`Failed updating user with id ${id}`);
      return _sanitizeUser(updated);
    },
  };
};
