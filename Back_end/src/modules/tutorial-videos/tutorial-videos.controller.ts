import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { tutorialVideosService } from './tutorial-videos.service';
import type { TutorialVideoIdParamDto } from './tutorial-videos.schema';

export async function listTutorialVideos(_req: Request, res: Response): Promise<void> {
  const videos = await tutorialVideosService.findAll();
  sendSuccess(res, videos, `${videos.length} vídeo(s) encontrado(s).`);
}

export async function getTutorialVideo(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as TutorialVideoIdParamDto;
  const video = await tutorialVideosService.findById(id);
  sendSuccess(res, video, 'Vídeo carregado com sucesso.');
}
