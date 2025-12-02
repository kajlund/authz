import { z } from 'zod';

import { BadRequestError } from '../utils/api-error.js';
const uuidSchema = z.uuidv4().trim();
const tokenSchema = z.string().min(64).max(64);

export function validateIdParam(req, res, next) {
  try {
    const id = uuidSchema.parse(req.params?.id);
    req.locals ??= {};
    req.locals.id = id;
    next();
  } catch (err) {
    next(new BadRequestError('Invalid id', err));
  }
}

export function validateTokenParam(req, res, next) {
  try {
    const token = tokenSchema.parse(req.params?.token);
    req.locals ??= {};
    req.locals.token = token;
    next();
  } catch (err) {
    next(new BadRequestError('Invalid token', err));
  }
}

export function validateBody(schema) {
  return function (req, res, next) {
    const vld = schema.safeParse(req.body);
    if (!vld.success) return next(new BadRequestError('Faulty body data', vld.error));
    req.locals ??= {};
    req.locals.body = vld.data;
    next();
  };
}
