import { z } from 'zod';

export const loginPayloadSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export const signupPayloadSchema = z.strictObject({
  alias: z.string().min(3).max(50).optional(),
  email: z.email(),
  password: z.string().min(8),
});
