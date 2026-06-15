import { z } from 'zod';

export const GuideSlugParamSchema = z.object({
  slug: z.string().min(2, 'Slug do guia é obrigatório.').max(120),
});

export type GuideSlugParamDto = z.infer<typeof GuideSlugParamSchema>;
