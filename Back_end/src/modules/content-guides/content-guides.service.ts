import { prisma } from '../../config/database';

const GUIDE_SLUG_ALIASES: Record<string, string> = {
  'troca-de-fralda': 'troca-de-fraldas',
  'prevencao-assaduras': 'prevencao-de-assaduras',
  'prevencao-quedas': 'prevencao-de-quedas',
};

const GUIDE_CANONICAL_SLUGS: Record<string, string> = Object.fromEntries(
  Object.entries(GUIDE_SLUG_ALIASES).map(([canonical, legacy]) => [legacy, canonical])
);

function getGuideSlugCandidate(slug: string): string {
  return GUIDE_SLUG_ALIASES[slug] ?? slug;
}

function getCanonicalGuideSlug(slug: string): string {
  return GUIDE_CANONICAL_SLUGS[slug] ?? slug;
}

function toArray<T = unknown>(value: unknown): T[] {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(value) ? (value as T[]) : [];
}

function mapGuideCard(guide: any) {
  const slug = getCanonicalGuideSlug(guide.slug);

  return {
    id: guide.id,
    slug,
    route: `/guia/${slug}`,
    title: guide.titulo,
    tag: guide.categoria_titulo,
    detail: guide.descricao_curta,
    steps: guide.total_passos ?? undefined,
    meta: guide.meta_card ?? guide.categoria_titulo,
    icon: guide.icone,
    tone: guide.tom,
    status: guide.status,
  };
}

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

function mapSection(section: any) {
  return {
    id: section.id,
    title: section.titulo,
    description: section.descricao ?? undefined,
    type: section.tipo,
    items: toArray<string>(section.itens),
    steps: toArray(section.passos),
    positionCards: toArray(section.cards_posicao),
    videoId: section.id_video ?? undefined,
  };
}

export class ContentGuidesService {
  async findAll() {
    const guides = await prisma.$queryRaw<any[]>`
      SELECT
        g.id,
        g.slug,
        g.titulo,
        g.descricao_curta,
        g.icone,
        g.tom,
        g.total_passos,
        g.meta_card,
        g.status,
        c.titulo AS categoria_titulo
      FROM guide g
      INNER JOIN guide_category c ON c.id = g.id_categoria
      WHERE g.status = 'published'
      ORDER BY g.ordem ASC
    `;

    return guides.map(mapGuideCard);
  }

  async findBySlug(slug: string) {
    const fallbackSlug = getGuideSlugCandidate(slug);
    const guides = await prisma.$queryRaw<any[]>`
      SELECT
        g.id,
        g.slug,
        g.titulo,
        g.descricao_curta,
        g.icone,
        g.tom,
        g.total_passos,
        g.meta_card,
        g.possui_dicas,
        g.possui_video,
        g.status,
        c.titulo AS categoria_titulo
      FROM guide g
      INNER JOIN guide_category c ON c.id = g.id_categoria
      WHERE (g.slug = ${slug} OR g.slug = ${fallbackSlug})
      LIMIT 1
    `;

    const guide = guides[0];

    if (!guide || guide.status !== 'published') {
      throw new Error('GUIDE_NOT_FOUND');
    }

    const sections = await prisma.$queryRaw<any[]>`
      SELECT
        id,
        tipo,
        titulo,
        descricao,
        itens,
        passos,
        cards_posicao,
        id_video
      FROM guide_section
      WHERE id_guia = ${guide.id}
      ORDER BY ordem ASC
    `;

    const videos = await prisma.$queryRaw<any[]>`
      SELECT
        v.id,
        v.youtube_id,
        v.titulo,
        v.descricao,
        v.url_externa,
        v.fonte
      FROM guide_tutorial_video gv
      INNER JOIN tutorial_video v ON v.id = gv.id_video
      WHERE gv.id_guia = ${guide.id}
      ORDER BY gv.ordem ASC
    `;

    return {
      id: guide.id,
      slug: getCanonicalGuideSlug(guide.slug),
      title: guide.titulo,
      category: guide.categoria_titulo,
      shortDescription: guide.descricao_curta,
      icon: guide.icone,
      tone: guide.tom,
      stepsCount: guide.total_passos ?? undefined,
      cardMeta: guide.meta_card ?? undefined,
      hasTips: guide.possui_dicas,
      hasVideo: guide.possui_video,
      status: guide.status,
      sections: sections.map(mapSection),
      videos: videos.map(mapVideo),
    };
  }
}

export const contentGuidesService = new ContentGuidesService();
