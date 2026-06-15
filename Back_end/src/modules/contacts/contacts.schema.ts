import { z } from 'zod';

export const SupportContactQuerySchema = z.object({
  patientId: z.string().uuid('patientId deve ser um UUID válido.'),
});

export const SupportContactIdParamSchema = z.object({
  id: z.string().uuid('ID do contato inválido.'),
});

export const CreateSupportContactSchema = z.object({
  patientId: z.string().uuid('ID do paciente é obrigatório.'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(100).trim(),
  role: z.string().min(2, 'Papel deve ter pelo menos 2 caracteres.').max(80).trim(),
  phone: z.string().min(8, 'Telefone deve ter pelo menos 8 caracteres.').max(20).trim(),
});

export const UpdateSupportContactSchema = CreateSupportContactSchema.omit({ patientId: true }).partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe pelo menos um campo para atualizar.' }
);

export type SupportContactQueryDto = z.infer<typeof SupportContactQuerySchema>;
export type SupportContactIdParamDto = z.infer<typeof SupportContactIdParamSchema>;
export type CreateSupportContactDto = z.infer<typeof CreateSupportContactSchema>;
export type UpdateSupportContactDto = z.infer<typeof UpdateSupportContactSchema>;
