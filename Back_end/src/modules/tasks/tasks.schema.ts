import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(3, 'O título deve ter pelo menos 3 caracteres.').max(120),
  detail: z.string().max(1000).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (deve ser HH:MM).'),
  category: z.string(),
  priority: z.string(),
  guideRoute: z.string().optional(),
});

export const TaskIdParamSchema = z.object({
  id: z.string().min(1, 'ID da tarefa inválido.'),
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type TaskIdParamDto = z.infer<typeof TaskIdParamSchema>;
