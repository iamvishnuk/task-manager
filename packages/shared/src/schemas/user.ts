import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .transform((val) => val.trim())
      .pipe(
        z
          .string()
          .min(1, 'Name is required')
          .max(30, 'Name must have atmost 30 characters')
      ),
    email: z
      .string()
      .transform((val) => val.trim())
      .transform((val) => val.toLocaleLowerCase())
      .pipe(
        z.string().min(1, 'Email is required').email('Enter a valid email')
      ),
    password: z
      .string()
      .trim()
      .min(1, 'Confirm password is required')
      .min(8, 'Password must have at least 8 characters')
      .max(255, 'Password must have at most 255 characters')
      .refine((password) => /[A-Z]/.test(password), {
        message: 'Password must contain at least one uppercase letter'
      })
      .refine((password) => /[a-z]/.test(password), {
        message: 'Password must contain at least one lowercase letter'
      })
      .refine((password) => /[0-9]/.test(password), {
        message: 'Password must contain at least one number'
      })
      .refine((password) => /[^A-Za-z0-9]/.test(password), {
        message: 'Password must contain at least one special character'
      }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, 'Confirm password is required')
      .min(8, 'Passwrod must have at least 8 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password do not match',
    path: ['confirmPassword']
  });

export const loginSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim())
    .transform((val) => val.toLocaleLowerCase())
    .pipe(
      z
        .string()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Invalid email' })
    ),
  password: z
    .string()
    .min(8, { message: 'Password must have at least 8 characters' })
    .max(255, { message: 'Password must have at most 255 characters' })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter'
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain at least one lowercase letter'
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Password must contain at least one number'
    })
    .refine((password) => /[^A-Za-z0-9]/.test(password), {
      message: 'Password must contain at least one special character'
    })
});

export type TRegisterSchema = z.infer<typeof registerSchema>;
export type TLoginSchema = z.infer<typeof loginSchema>;

