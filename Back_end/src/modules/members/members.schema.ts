import { z } from 'zod';

export const PatientParamSchema = z.object({
  id: z.string().uuid('ID do paciente inválido.'),
});

export const MemberIdParamSchema = z.object({
  id: z.string().uuid('ID do vínculo inválido.'),
});

export const MemberRoleSchema = z.enum(['responsible', 'family', 'caregiver', 'nurse']);

export const CreateMemberSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  name: z.string().min(2).max(120).trim().optional(),
  role: MemberRoleSchema.default('family'),
}).refine((data) => data.userId || data.email, {
  message: 'Informe userId ou email do membro.',
});

export const UpdateMemberSchema = z.object({
  role: MemberRoleSchema.optional(),
  active: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Informe pelo menos um campo para atualizar.',
});

export type PatientParamDto = z.infer<typeof PatientParamSchema>;
export type MemberIdParamDto = z.infer<typeof MemberIdParamSchema>;
export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
