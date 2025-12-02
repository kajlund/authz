import { z } from 'zod';

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

export const changePasswordSchema = z
  .strictObject({
    oldPassword: z.string().trim(),
    newPassword: z.string().trim().min(8),
    confirmPassword: z.string().trim().min(8),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: 'Password confirmation must match the new password',
    path: ['confirmPassword'],
  });

export const resetPasswordSchema = z
  .strictObject({
    newPassword: z.string().trim().min(8),
    confirmPassword: z.string().trim().min(8),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: 'Password confirmation must match the new password',
    path: ['confirmPassword'],
  });
