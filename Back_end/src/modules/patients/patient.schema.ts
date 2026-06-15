import { z } from 'zod';

export const PatientIdParamSchema = z.object({
  id: z.string().uuid('ID do paciente inválido.'),
});

const PatientBaseSchema = z.object({
  name: z.string().min(2).max(120).trim().optional(),
  nome: z.string().min(2).max(120).trim().optional(),
  birthDate: z.coerce.date().optional(),
  dataNascimento: z.coerce.date().optional(),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos.').optional(),
  sex: z.string().max(30).optional(),
  sexo: z.string().max(30).optional(),
  weight: z.number().positive().optional(),
  peso: z.number().positive().optional(),
  healthConditions: z.union([z.array(z.string()), z.string()]).optional(),
  condicoesMedicinais: z.union([z.array(z.string()), z.string()]).optional(),
  notes: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),
});

export const CreatePatientSchema = PatientBaseSchema.refine((data) => data.name || data.nome, {
  message: 'Nome do paciente é obrigatório.',
  path: ['name'],
});

export const UpdatePatientSchema = PatientBaseSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe pelo menos um campo para atualizar.' }
);

export type PatientIdParamDto = z.infer<typeof PatientIdParamSchema>;
export type CreatePatientDto = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>;
