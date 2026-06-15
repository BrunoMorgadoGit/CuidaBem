import { z } from 'zod';

export const TutorialVideoIdParamSchema = z.object({
  id: z.string().min(2, 'ID do vídeo é obrigatório.').max(120),
});

export type TutorialVideoIdParamDto = z.infer<typeof TutorialVideoIdParamSchema>;
