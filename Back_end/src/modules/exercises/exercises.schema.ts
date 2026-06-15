import { z } from 'zod';

export const ExerciseIdParamSchema = z.object({
  id: z.string().min(2, 'ID do exercício é obrigatório.').max(120),
});

export type ExerciseIdParamDto = z.infer<typeof ExerciseIdParamSchema>;
