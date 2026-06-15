import { z } from 'zod';
import { validarForcaSenha } from '../../shared/utils/validador-senha';

const passwordSchema = z.string().superRefine((value, context) => {
  const result = validarForcaSenha(value);
  if (!result.valido) {
    result.erros.forEach((message) => {
      context.addIssue({ code: z.ZodIssueCode.custom, message });
    });
  }
});

const optionalCpfSchema = z
  .string()
  .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos.')
  .optional();

const patientInputSchema = z
  .object({
    name: z.string().min(2).max(120).trim().optional(),
    nome: z.string().min(2).max(120).trim().optional(),
    birthDate: z.coerce.date().optional(),
    dataNascimento: z.coerce.date().optional(),
    cpf: optionalCpfSchema,
    sex: z.string().max(30).optional(),
    sexo: z.string().max(30).optional(),
    weight: z.number().positive().optional(),
    peso: z.number().positive().optional(),
    healthConditions: z.union([z.array(z.string()), z.string()]).optional(),
    condicoesMedicinais: z.union([z.array(z.string()), z.string()]).optional(),
    photoUrl: z.string().url().optional(),
  })
  .optional();

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(120).trim().optional(),
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(120).trim().optional(),
    email: z.string().email('Email inválido.').toLowerCase().trim(),
    password: passwordSchema.optional(),
    senha: passwordSchema.optional(),
    cpf: optionalCpfSchema,
    phone: z.string().max(20).trim().optional(),
    telefone: z.string().max(20).trim().optional(),
    accountName: z.string().min(2).max(120).trim().optional(),
    patientName: z.string().min(2).max(120).trim().optional(),
    nomePaciente: z.string().min(2).max(120).trim().optional(),
    patient: patientInputSchema,
    paciente: patientInputSchema,
  })
  .refine((data) => data.name || data.nome, { message: 'Nome do usuário é obrigatório.', path: ['name'] })
  .refine((data) => data.password || data.senha, { message: 'Senha é obrigatória.', path: ['password'] });

export const LoginSchema = z.object({
  email: z.string().email('Email inválido.').toLowerCase().trim(),
  password: z.string().min(1, 'A senha é obrigatória.').optional(),
  senha: z.string().min(1, 'A senha é obrigatória.').optional(),
}).refine((data) => data.password || data.senha, { message: 'Senha é obrigatória.', path: ['password'] });

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório.'),
});

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RefreshDto = z.infer<typeof RefreshSchema>;
export type LogoutDto = z.infer<typeof LogoutSchema>;
