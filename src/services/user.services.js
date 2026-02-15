import {
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../utils/api.error.js';
import { getUserDAO } from '../db/user.dao.js';
import { getAuthUtils } from '../utils/auth.utils.js';
import { patchEntity } from '../utils/shared.js';

export const getUserServices = (cnf, log) => {
  const authUtils = getAuthUtils(cnf, log);
  const dao = getUserDAO(log);

  function _sanitizeUser(user) {
    let { id, alias, email, avatar, role, createdAt, updatedAt } = user;
    if (!avatar) avatar = authUtils.getGravatarUrl(email);
    return { id, alias, email, avatar, role, createdAt, updatedAt };
  }

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
      const user = await dao.findUserById(id);
      if (!user) throw new NotFoundError(`User with id ${id} was not found`);

      const { alias, avatar } = user;
      const original = { alias, avatar };
      const cleanPayload = patchEntity(original, payload, ['alias', 'avatar'], {
        allowEmpty: false,
      });

      const updated = await dao.updateUser(id, cleanPayload);
      if (!updated)
        throw new InternalServerError(`Failed updating user with id ${id}`);
      return _sanitizeUser(updated);
    },
  };
};
