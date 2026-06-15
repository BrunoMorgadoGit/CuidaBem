import { z } from 'zod';

export const UpdateMeSchema = z
  .object({
    name: z.string().min(2).max(120).trim().optional(),
    nome: z.string().min(2).max(120).trim().optional(),
    phone: z.string().max(20).trim().nullable().optional(),
    telefone: z.string().max(20).trim().nullable().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe pelo menos um campo para atualizar.',
  });

export type UpdateMeDto = z.infer<typeof UpdateMeSchema>;
