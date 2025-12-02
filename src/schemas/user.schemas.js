import { z } from 'zod';

export const newUserSchema = z.strictObject({
  email: z.email().lowercase().trim(),
  password: z.string().trim().min(8),
  alias: z.string().min(3).max(50).trim(),
  avatar: z.url().trim().optional(),
});
