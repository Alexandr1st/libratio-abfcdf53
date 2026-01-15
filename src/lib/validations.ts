import { z } from 'zod';

// Book validation schema
export const bookSchema = z.object({
  title: z.string()
    .min(1, 'Название обязательно')
    .max(500, 'Название должно быть не более 500 символов'),
  author: z.string()
    .min(1, 'Автор обязателен')
    .max(200, 'Имя автора должно быть не более 200 символов'),
  genre: z.string()
    .min(1, 'Жанр обязателен')
    .max(100, 'Жанр должен быть не более 100 символов'),
  description: z.string()
    .max(2000, 'Описание должно быть не более 2000 символов')
    .optional()
    .nullable()
    .transform(val => val || null),
  image: z.string()
    .max(1000, 'URL изображения должен быть не более 1000 символов')
    .optional()
    .nullable()
    .transform(val => val || null),
  pages: z.union([
    z.number().int().min(1, 'Минимум 1 страница').max(50000, 'Максимум 50000 страниц'),
    z.string().transform(val => val ? parseInt(val, 10) : null),
    z.null(),
  ]).optional().nullable(),
  year: z.union([
    z.number().int().min(1000, 'Год должен быть не менее 1000').max(new Date().getFullYear() + 5, 'Некорректный год'),
    z.string().transform(val => val ? parseInt(val, 10) : null),
    z.null(),
  ]).optional().nullable(),
});

export type BookFormData = z.infer<typeof bookSchema>;

// User registration validation schema
export const userRegistrationSchema = z.object({
  email: z.string()
    .min(1, 'Email обязателен')
    .email('Некорректный email адрес')
    .max(255, 'Email должен быть не более 255 символов'),
  password: z.string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(72, 'Пароль должен быть не более 72 символов')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/\d/, 'Пароль должен содержать хотя бы одну цифру'),
  full_name: z.string()
    .min(1, 'Имя обязательно')
    .max(100, 'Имя должно быть не более 100 символов'),
  username: z.string()
    .min(3, 'Username должен быть не менее 3 символов')
    .max(30, 'Username должен быть не более 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username может содержать только буквы, цифры и подчеркивания')
    .optional()
    .nullable(),
});

export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;

// User login validation schema
export const userLoginSchema = z.object({
  email: z.string()
    .min(1, 'Email обязателен')
    .email('Некорректный email адрес')
    .max(255, 'Email должен быть не более 255 символов'),
  password: z.string()
    .min(1, 'Пароль обязателен'),
});

export type UserLoginFormData = z.infer<typeof userLoginSchema>;

// Club creation validation schema
export const clubSchema = z.object({
  name: z.string()
    .min(1, 'Название клуба обязательно')
    .max(200, 'Название должно быть не более 200 символов'),
  description: z.string()
    .max(1000, 'Описание должно быть не более 1000 символов')
    .optional()
    .nullable()
    .transform(val => val || null),
  location: z.string()
    .max(200, 'Местоположение должно быть не более 200 символов')
    .optional()
    .nullable()
    .transform(val => val || null),
  website: z.string()
    .max(500, 'URL должен быть не более 500 символов')
    .refine(
      val => !val || val.length === 0 || /^https?:\/\/.+/.test(val),
      'URL должен начинаться с http:// или https://'
    )
    .optional()
    .nullable()
    .transform(val => val || null),
});

export type ClubFormData = z.infer<typeof clubSchema>;

// Admin user creation schema
export const adminUserSchema = z.object({
  email: z.string()
    .min(1, 'Email обязателен')
    .email('Некорректный email адрес')
    .max(255, 'Email должен быть не более 255 символов'),
  password: z.string()
    .min(8, 'Пароль должен быть не менее 8 символов')
    .max(72, 'Пароль должен быть не более 72 символов'),
  full_name: z.string()
    .min(1, 'Имя обязательно')
    .max(100, 'Имя должно быть не более 100 символов'),
  username: z.string()
    .min(3, 'Username должен быть не менее 3 символов')
    .max(30, 'Username должен быть не более 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username может содержать только буквы, цифры и подчеркивания'),
});

export type AdminUserFormData = z.infer<typeof adminUserSchema>;

// Profile update schema
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .max(100, 'Имя должно быть не более 100 символов')
    .optional()
    .nullable(),
  username: z.string()
    .min(3, 'Username должен быть не менее 3 символов')
    .max(30, 'Username должен быть не более 30 символов')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username может содержать только буквы, цифры и подчеркивания')
    .optional()
    .nullable(),
  club_id: z.string().uuid().optional().nullable().or(z.literal('')),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// Helper function to get first validation error
export const getFirstError = (errors: z.ZodError): string => {
  const firstError = errors.errors[0];
  return firstError?.message || 'Ошибка валидации';
};
