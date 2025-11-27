import { z } from 'zod';

export const loginPayloadSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export const signupPayloadSchema = z.strictObject({
  email: z.email().lowercase().trim(),
  password: z.string().trim().min(8),
  alias: z.string().min(3).max(50).trim().optional(),
  avatar: z.url().trim().optional(),
});
