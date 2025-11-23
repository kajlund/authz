/* eslint-disable no-unused-vars */
import { codes, phrases } from './utils/status.js';
// import { getUserServices } from './services/user.services.js';

export function getHandlers(log) {
  // const svcUser = getUserServices(log);

  return { deleteUser, getCurrentUser, loginUser, logoutUser, registerUser };
}

function deleteUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function getCurrentUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function loginUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function logoutUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}

function registerUser(req, res, next) {
  res.status(codes.NOT_IMPLEMENTED).send(phrases.NOT_IMPLEMENTED);
}
