import { z } from 'zod';

const phoneRegex = /^[0-9()+\-\s]{10,20}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Informe seu nome completo')
    .refine((v) => v.split(/\s+/).length >= 2, 'Informe nome e sobrenome'),
  email: z.string().trim().toLowerCase().email('E-mail invalido'),
  phone: z.string().trim().regex(phoneRegex, 'Telefone invalido'),
  password: z.string().min(6, 'A senha precisa ter no minimo 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail invalido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const lessonSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().trim().min(3, 'Titulo muito curto'),
  description: z.string().trim().optional().default(''),
  video_type: z.enum(['upload', 'external']),
  video_url: z.string().trim().optional().default(''),
  video_path: z.string().trim().optional().default(''),
  thumbnail_url: z.string().trim().optional().default(''),
  duration_seconds: z.coerce.number().int().min(0).optional().default(0),
  release_mode: z.enum(['free', 'manual', 'scheduled']),
  is_released: z.coerce.boolean().optional().default(false),
  release_at: z.string().trim().optional().nullable(),
  is_published: z.coerce.boolean().optional().default(true),
  position: z.coerce.number().int().min(0).optional().default(0),
});

export const moduleSchema = z.object({
  course_id: z.coerce.number().int().positive(),
  title: z.string().trim().min(3, 'Titulo muito curto'),
  description: z.string().trim().optional().default(''),
  position: z.coerce.number().int().min(0).optional().default(0),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3, 'Titulo muito curto'),
  subtitle: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  cover_url: z.string().trim().optional().default(''),
  is_published: z.coerce.boolean().optional().default(false),
  sequential: z.coerce.boolean().optional().default(false),
  auto_enroll: z.coerce.boolean().optional().default(true),
});

export function fieldErrors(error) {
  const out = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export const profileSchema = z
  .object({
    phone: z.string().trim().regex(phoneRegex, 'Telefone invalido'),
    currentPassword: z.string().min(1, 'Informe sua senha atual'),
    newPassword: z.string().optional().default(''),
    confirmPassword: z.string().optional().default(''),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword && newPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['newPassword'],
        message: 'A nova senha precisa ter no minimo 6 caracteres',
      });
    }

    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'As senhas nao conferem',
      });
    }
  });
