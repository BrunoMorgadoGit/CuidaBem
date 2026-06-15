import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { contentGuidesService } from './content-guides.service';
import type { GuideSlugParamDto } from './content-guides.schema';

export async function listGuides(_req: Request, res: Response): Promise<void> {
  const guides = await contentGuidesService.findAll();
  sendSuccess(res, guides, `${guides.length} guia(s) encontrado(s).`);
}

export async function getGuide(req: Request, res: Response): Promise<void> {
  const { slug } = req.params as unknown as GuideSlugParamDto;
  const guide = await contentGuidesService.findBySlug(slug);
  sendSuccess(res, guide, 'Guia carregado com sucesso.');
}
