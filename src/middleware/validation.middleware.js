import { z } from 'zod';

import { BadRequestError } from '../utils/api.error.js';

const tokenSchema = z.string().min(64).max(64);
const cuidSchema = z.string().min(24).max(24);

export const loginSchema = z.strictObject({
  email: z.email().lowercase().trim(),
  password: z.string().trim(),
});

export const userSchema = z.strictObject({
  email: z.email().lowercase().trim(),
  password: z.string().trim().min(8),
  alias: z.string().min(3).max(50).trim(),
  avatar: z.url().trim().optional(),
});

export function validateIdParam(req, res, next) {
  try {
    const id = cuidSchema.parse(req.params?.id);
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
    if (!vld.success)
      return next(new BadRequestError('Faulty body data', vld.error));
    req.locals ??= {};
    req.locals.payload = vld.data;
    next();
  };
}
