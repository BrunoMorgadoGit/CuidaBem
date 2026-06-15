import { prisma } from '../../config/database';

function mapVideo(video: any) {
  return {
    id: video.id,
    youtubeId: video.youtube_id,
    title: video.titulo,
    description: video.descricao,
    externalUrl: video.url_externa,
    source: video.fonte ?? undefined,
  };
}

export class TutorialVideosService {
  async findAll() {
    const videos = await prisma.$queryRaw<any[]>`
      SELECT id, youtube_id, titulo, descricao, url_externa, fonte
      FROM tutorial_video
      ORDER BY ordem ASC
    `;

    return videos.map(mapVideo);
  }

  async findById(id: string) {
    const videos = await prisma.$queryRaw<any[]>`
      SELECT id, youtube_id, titulo, descricao, url_externa, fonte
      FROM tutorial_video
      WHERE id = ${id}
      LIMIT 1
    `;
    const video = videos[0];
    if (!video) throw new Error('TUTORIAL_VIDEO_NOT_FOUND');
    return mapVideo(video);
  }
}

export const tutorialVideosService = new TutorialVideosService();
