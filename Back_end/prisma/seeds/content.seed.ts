import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

type SeedSection = {
  tipo: string;
  titulo: string;
  descricao?: string;
  itens?: string[];
  passos?: Array<{ id: string; order: number; title: string; description: string; tip?: string }>;
  id_video?: string;
};

type SeedGuide = {
  id: string;
  slug: string;
  id_categoria: string;
  titulo: string;
  descricao_curta: string;
  icone: string;
  tom: string;
  total_passos?: number;
  meta_card?: string;
  possui_dicas?: boolean;
  possui_video?: boolean;
  ordem: number;
  videoIds?: string[];
  secoes: SeedSection[];
};

const tutorialVideos = [
  {
    id: 'video-banho-leito',
    youtube_id: 'lGkuGMfDFI8',
    titulo: 'Banho de leito',
    descricao: 'Demonstração auxiliar para banho de leito com segurança e conforto.',
    url_externa: 'https://youtu.be/lGkuGMfDFI8?si=uc-NrcnAmQGT9qKl',
    fonte: 'YouTube',
    ordem: 1,
  },
  {
    id: 'video-higiene-bucal',
    youtube_id: 'Ub1W0_kV57o',
    titulo: 'Higiene bucal',
    descricao: 'Cuidados para manter a saúde bucal da pessoa idosa ou acamada.',
    url_externa: 'https://youtu.be/Ub1W0_kV57o?si=XF3I6IA40gr2zD0Q',
    fonte: 'YouTube',
    ordem: 2,
  },
  {
    id: 'video-troca-fraldas',
    youtube_id: 'PX13v8miNRI',
    titulo: 'Troca de fraldas',
    descricao: 'Orientações visuais para troca de fraldas com higiene e prevenção de lesões.',
    url_externa: 'https://youtu.be/PX13v8miNRI?si=cahWzx36D1IUgsGx',
    fonte: 'YouTube',
    ordem: 3,
  },
  {
    id: 'video-prevencao-assaduras',
    youtube_id: 'ono7FGI-MyU',
    titulo: 'Prevenção de assaduras',
    descricao: 'Cuidados de pele para reduzir umidade, atrito e irritações.',
    url_externa: 'https://youtu.be/ono7FGI-MyU?si=7zZVbWf3yacPzqWN',
    fonte: 'YouTube',
    ordem: 4,
  },
  {
    id: 'video-prevencao-quedas',
    youtube_id: '3YyDC203_qg',
    titulo: 'Prevenção de quedas',
    descricao: 'Medidas simples para diminuir riscos no ambiente e na rotina.',
    url_externa: 'https://youtu.be/3YyDC203_qg?si=-ezuy7Zp-DmsjHPE',
    fonte: 'YouTube',
    ordem: 5,
  },
];

const guideCategories = [
  { id: 'hygiene-care', titulo: 'Cuidados de higiene', ordem: 1 },
  { id: 'skin-care', titulo: 'Cuidados com a pele', ordem: 2 },
  { id: 'safety', titulo: 'Segurança', ordem: 3 },
  { id: 'mobility', titulo: 'Mobilidade e posicionamento', ordem: 4 },
  { id: 'records', titulo: 'Registro do cuidado', ordem: 5 },
];

const guides: SeedGuide[] = [
  {
    id: 'guide-bed-bath',
    slug: 'banho-de-leito',
    id_categoria: 'hygiene-care',
    titulo: 'Banho de Leito',
    descricao_curta: 'Higiene completa para pessoa acamada com segurança e privacidade.',
    icone: 'BL',
    tom: 'blue',
    total_passos: 6,
    meta_card: '6 passos',
    possui_dicas: true,
    possui_video: true,
    ordem: 1,
    videoIds: ['video-banho-leito'],
    secoes: [
      {
        tipo: 'introduction',
        titulo: 'Objetivo do cuidado',
        descricao: 'O banho de leito mantém higiene, conforto e permite observar sinais de alterações na pele.',
      },
      {
        tipo: 'materials',
        titulo: 'Materiais necessários',
        itens: ['Luvas descartáveis', 'Bacias com água morna', 'Toalhas', 'Sabonete neutro', 'Roupas limpas'],
      },
      {
        tipo: 'steps',
        titulo: 'Passo a passo',
        passos: [
          { id: 'prepare-room', order: 1, title: 'Prepare o ambiente', description: 'Feche portas e janelas, organize materiais e preserve a privacidade.' },
          { id: 'wash-face', order: 2, title: 'Comece pelo rosto', description: 'Use pano limpo e úmido, sem sabão próximo aos olhos.' },
          { id: 'clean-body', order: 3, title: 'Higienize por partes', description: 'Descubra apenas a região que está sendo limpa.' },
          { id: 'dry-skin', order: 4, title: 'Seque cuidadosamente', description: 'Dê atenção às dobras, costas e região íntima.' },
          { id: 'change-clothes', order: 5, title: 'Troque roupas e lençóis', description: 'Mantenha o idoso aquecido e confortável.' },
          { id: 'observe-record', order: 6, title: 'Observe e registre', description: 'Anote vermelhidão, feridas, dor ou desconforto.' },
        ],
      },
      {
        tipo: 'warning',
        titulo: 'Cuidados importantes',
        itens: ['Nunca use água muito quente.', 'Interrompa o cuidado em caso de dor intensa ou falta de ar.', 'Comunique alterações de pele à equipe de saúde.'],
      },
      {
        tipo: 'video',
        titulo: 'Vídeo auxiliar',
        descricao: 'Assista ao tutorial antes de realizar o procedimento pela primeira vez.',
        id_video: 'video-banho-leito',
      },
    ],
  },
  {
    id: 'guide-oral-hygiene',
    slug: 'higiene-bucal',
    id_categoria: 'hygiene-care',
    titulo: 'Higiene Bucal',
    descricao_curta: 'Limpeza da boca, dentes, língua e próteses com cuidado.',
    icone: 'HB',
    tom: 'green',
    total_passos: 5,
    meta_card: '5 passos',
    possui_video: true,
    ordem: 2,
    videoIds: ['video-higiene-bucal'],
    secoes: [
      { tipo: 'introduction', titulo: 'Por que fazer?', descricao: 'A higiene bucal reduz infecções, mau hálito e desconfortos durante a alimentação.' },
      { tipo: 'materials', titulo: 'Materiais necessários', itens: ['Escova macia', 'Creme dental', 'Gaze ou espátula com gaze', 'Copo com água', 'Toalha'] },
      {
        tipo: 'steps',
        titulo: 'Passo a passo',
        passos: [
          { id: 'position-person', order: 1, title: 'Posicione a pessoa', description: 'Mantenha a cabeça elevada sempre que possível.' },
          { id: 'brush-teeth', order: 2, title: 'Escove dentes e gengiva', description: 'Faça movimentos suaves, sem força excessiva.' },
          { id: 'clean-tongue', order: 3, title: 'Limpe língua e bochechas', description: 'Use gaze úmida se a escova causar desconforto.' },
          { id: 'clean-prosthesis', order: 4, title: 'Cuide da prótese', description: 'Retire, escove e guarde em local adequado quando indicado.' },
          { id: 'finish', order: 5, title: 'Finalize com conforto', description: 'Seque a boca e observe feridas ou sangramentos.' },
        ],
      },
      { tipo: 'video', titulo: 'Vídeo auxiliar', id_video: 'video-higiene-bucal' },
    ],
  },
  {
    id: 'guide-diaper-change',
    slug: 'troca-de-fralda',
    id_categoria: 'hygiene-care',
    titulo: 'Troca de Fraldas',
    descricao_curta: 'Troca segura com higiene, conforto e prevenção de assaduras.',
    icone: 'TF',
    tom: 'purple',
    total_passos: 6,
    meta_card: '6 passos',
    possui_video: true,
    ordem: 3,
    videoIds: ['video-troca-fraldas'],
    secoes: [
      { tipo: 'introduction', titulo: 'Objetivo', descricao: 'A troca correta reduz umidade, desconforto, assaduras e risco de infecção.' },
      { tipo: 'materials', titulo: 'Materiais necessários', itens: ['Fralda limpa', 'Luvas', 'Lenços ou água e sabonete', 'Creme barreira', 'Saco para descarte'] },
      {
        tipo: 'steps',
        titulo: 'Passo a passo',
        passos: [
          { id: 'prepare', order: 1, title: 'Prepare tudo antes', description: 'Deixe os materiais ao alcance para não abandonar a pessoa.' },
          { id: 'remove', order: 2, title: 'Retire a fralda usada', description: 'Faça movimentos suaves e proteja a pele.' },
          { id: 'clean', order: 3, title: 'Higienize corretamente', description: 'Limpe da frente para trás, principalmente em mulheres.' },
          { id: 'dry', order: 4, title: 'Seque bem', description: 'Não esfregue; pressione levemente a toalha.' },
          { id: 'barrier', order: 5, title: 'Aplique proteção', description: 'Use creme barreira se houver indicação.' },
          { id: 'new-diaper', order: 6, title: 'Coloque a fralda limpa', description: 'Ajuste sem apertar a cintura ou pernas.' },
        ],
      },
      { tipo: 'warning', titulo: 'Sinais de alerta', itens: ['Vermelhidão persistente.', 'Feridas abertas.', 'Dor, secreção ou mau cheiro.'] },
      { tipo: 'video', titulo: 'Vídeo auxiliar', id_video: 'video-troca-fraldas' },
    ],
  },
  {
    id: 'guide-rash-prevention',
    slug: 'prevencao-assaduras',
    id_categoria: 'skin-care',
    titulo: 'Prevenção de Assaduras',
    descricao_curta: 'Cuidados para proteger a pele contra umidade e atrito.',
    icone: 'PA',
    tom: 'orange',
    total_passos: 4,
    meta_card: 'Pele',
    possui_video: true,
    ordem: 4,
    videoIds: ['video-prevencao-assaduras'],
    secoes: [
      { tipo: 'introduction', titulo: 'Prevenção diária', descricao: 'Assaduras podem evoluir rapidamente em idosos frágeis ou acamados.' },
      {
        tipo: 'steps',
        titulo: 'Cuidados principais',
        passos: [
          { id: 'clean', order: 1, title: 'Higienize com suavidade', description: 'Use água e sabonete neutro quando possível.' },
          { id: 'dry', order: 2, title: 'Mantenha a pele seca', description: 'Seque dobras e região íntima cuidadosamente.' },
          { id: 'barrier', order: 3, title: 'Use barreira protetora', description: 'Aplique camada fina conforme orientação.' },
          { id: 'observe', order: 4, title: 'Observe todos os dias', description: 'Registre vermelhidão, dor ou feridas.' },
        ],
      },
      { tipo: 'video', titulo: 'Vídeo auxiliar', id_video: 'video-prevencao-assaduras' },
      { tipo: 'warning', titulo: 'Quando pedir ajuda', itens: ['Se houver ferida aberta.', 'Se a vermelhidão aumentar.', 'Se houver secreção ou febre.'] },
    ],
  },
  {
    id: 'guide-fall-prevention',
    slug: 'prevencao-quedas',
    id_categoria: 'safety',
    titulo: 'Prevenção de Quedas',
    descricao_curta: 'Organização do ambiente e rotina para reduzir acidentes.',
    icone: 'PQ',
    tom: 'cyan',
    total_passos: 5,
    meta_card: 'Segurança',
    possui_video: true,
    ordem: 5,
    videoIds: ['video-prevencao-quedas'],
    secoes: [
      { tipo: 'introduction', titulo: 'Risco de queda', descricao: 'Quedas podem causar fraturas, internações e perda de autonomia.' },
      { tipo: 'video', titulo: 'Demonstração em vídeo', id_video: 'video-prevencao-quedas' },
      { tipo: 'list', titulo: 'Cuidados no ambiente', itens: ['Remova tapetes soltos.', 'Mantenha boa iluminação.', 'Evite fios no caminho.', 'Use calçados fechados e antiderrapantes.'] },
      { tipo: 'warning', titulo: 'Atenção', itens: ['Tontura, sonolência e fraqueza aumentam o risco.', 'Revise medicamentos com profissional de saúde.'] },
    ],
  },
  {
    id: 'guide-mobility',
    slug: 'mobilidade',
    id_categoria: 'mobility',
    titulo: 'Mobilidade',
    descricao_curta: 'Orientações para apoiar deslocamentos com segurança.',
    icone: 'MO',
    tom: 'blue',
    total_passos: 4,
    meta_card: 'Rotina',
    ordem: 6,
    secoes: [
      { tipo: 'introduction', titulo: 'Mobilidade segura', descricao: 'A mobilidade deve respeitar limites, dor, fadiga e orientação profissional.' },
      { tipo: 'list', titulo: 'Antes de caminhar', itens: ['Verifique calçados.', 'Confirme se há apoio por perto.', 'Evite pressa.', 'Observe tontura ou falta de ar.'] },
      { tipo: 'warning', titulo: 'Importante', itens: ['Exercícios ficam na Central de Exercícios.', 'Não force movimentos dolorosos.'] },
    ],
  },
  {
    id: 'guide-positioning',
    slug: 'posicionamento',
    id_categoria: 'mobility',
    titulo: 'Posicionamento',
    descricao_curta: 'Mudança de posição e conforto para reduzir pressão na pele.',
    icone: 'PO',
    tom: 'green',
    total_passos: 4,
    meta_card: 'Conforto',
    ordem: 7,
    secoes: [
      { tipo: 'introduction', titulo: 'Por que alternar posição?', descricao: 'Mudanças de posição reduzem pressão contínua e desconforto.' },
      { tipo: 'list', titulo: 'Boas práticas', itens: ['Alinhe cabeça, tronco e membros.', 'Use travesseiros para apoio.', 'Evite arrastar a pele.', 'Observe vermelhidão em proeminências ósseas.'] },
      { tipo: 'warning', titulo: 'Segurança', itens: ['Peça ajuda se a pessoa for pesada ou rígida.', 'Não faça transferências sem técnica adequada.'] },
    ],
  },
  {
    id: 'guide-lesion-prevention',
    slug: 'prevencao-de-lesoes',
    id_categoria: 'skin-care',
    titulo: 'Prevenção de Lesões',
    descricao_curta: 'Cuidados para prevenir lesões por pressão e feridas.',
    icone: 'PL',
    tom: 'orange',
    total_passos: 5,
    meta_card: 'Pele',
    ordem: 8,
    secoes: [
      { tipo: 'introduction', titulo: 'Atenção à pele', descricao: 'Lesões por pressão podem surgir em poucas horas em pessoas com mobilidade reduzida.' },
      { tipo: 'list', titulo: 'Rotina de prevenção', itens: ['Observe pele diariamente.', 'Mantenha hidratação.', 'Reduza umidade.', 'Alterne posição.', 'Registre alterações.'] },
      { tipo: 'warning', titulo: 'Procure orientação', itens: ['Feridas abertas.', 'Escurecimento da pele.', 'Dor local ou secreção.'] },
    ],
  },
  {
    id: 'guide-care-record',
    slug: 'registro-do-cuidado',
    id_categoria: 'records',
    titulo: 'Registro do Cuidado',
    descricao_curta: 'Como registrar tarefas, observações e mudanças importantes.',
    icone: 'RC',
    tom: 'purple',
    total_passos: 4,
    meta_card: 'Histórico',
    ordem: 9,
    secoes: [
      { tipo: 'introduction', titulo: 'Por que registrar?', descricao: 'Registros ajudam familiares e profissionais a entender evolução e rotina.' },
      { tipo: 'list', titulo: 'O que anotar', itens: ['Tarefas concluídas.', 'Mudanças de humor ou sono.', 'Sinais vitais.', 'Feridas, quedas ou recusa alimentar.', 'Quem realizou o cuidado.'] },
      { tipo: 'warning', titulo: 'Privacidade', itens: ['Registre apenas informações necessárias.', 'Proteja dados pessoais e de saúde.'] },
    ],
  },
];

export async function seedContent(prisma: PrismaClient): Promise<void> {
  for (const category of guideCategories) {
    await prisma.$executeRaw`
      INSERT INTO guide_category (id, titulo, ordem)
      VALUES (${category.id}, ${category.titulo}, ${category.ordem})
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        ordem = VALUES(ordem)
    `;
  }

  for (const video of tutorialVideos) {
    await prisma.$executeRaw`
      INSERT INTO tutorial_video (id, youtube_id, titulo, descricao, url_externa, fonte, ordem)
      VALUES (
        ${video.id},
        ${video.youtube_id},
        ${video.titulo},
        ${video.descricao},
        ${video.url_externa},
        ${video.fonte},
        ${video.ordem}
      )
      ON DUPLICATE KEY UPDATE
        youtube_id = VALUES(youtube_id),
        titulo = VALUES(titulo),
        descricao = VALUES(descricao),
        url_externa = VALUES(url_externa),
        fonte = VALUES(fonte),
        ordem = VALUES(ordem)
    `;
  }

  for (const guide of guides) {
    await prisma.$executeRaw`
      INSERT INTO guide (
        id,
        slug,
        id_categoria,
        titulo,
        descricao_curta,
        icone,
        tom,
        total_passos,
        meta_card,
        possui_dicas,
        possui_video,
        status,
        ordem
      )
      VALUES (
        ${guide.id},
        ${guide.slug},
        ${guide.id_categoria},
        ${guide.titulo},
        ${guide.descricao_curta},
        ${guide.icone},
        ${guide.tom},
        ${guide.total_passos ?? null},
        ${guide.meta_card ?? null},
        ${guide.possui_dicas ?? false},
        ${guide.possui_video ?? false},
        'published',
        ${guide.ordem}
      )
      ON DUPLICATE KEY UPDATE
        slug = VALUES(slug),
        id_categoria = VALUES(id_categoria),
        titulo = VALUES(titulo),
        descricao_curta = VALUES(descricao_curta),
        icone = VALUES(icone),
        tom = VALUES(tom),
        total_passos = VALUES(total_passos),
        meta_card = VALUES(meta_card),
        possui_dicas = VALUES(possui_dicas),
        possui_video = VALUES(possui_video),
        status = VALUES(status),
        ordem = VALUES(ordem)
    `;

    await prisma.$executeRaw`DELETE FROM guide_section WHERE id_guia = ${guide.id}`;
    for (const [index, section] of guide.secoes.entries()) {
      await prisma.$executeRaw`
        INSERT INTO guide_section (
          id,
          id_guia,
          tipo,
          titulo,
          descricao,
          itens,
          passos,
          cards_posicao,
          id_video,
          ordem
        )
        VALUES (
          ${randomUUID()},
          ${guide.id},
          ${section.tipo},
          ${section.titulo},
          ${section.descricao ?? null},
          ${section.itens ? JSON.stringify(section.itens) : null},
          ${section.passos ? JSON.stringify(section.passos) : null},
          null,
          ${section.id_video ?? null},
          ${index + 1}
        )
      `;
    }

    await prisma.$executeRaw`DELETE FROM guide_tutorial_video WHERE id_guia = ${guide.id}`;
    if (guide.videoIds?.length) {
      for (const [index, videoId] of guide.videoIds.entries()) {
        await prisma.$executeRaw`
          INSERT INTO guide_tutorial_video (id_guia, id_video, ordem)
          VALUES (${guide.id}, ${videoId}, ${index + 1})
        `;
      }
    }
  }

  console.log(`Conteúdo seedado: ${guides.length} guia(s), ${tutorialVideos.length} vídeo(s).`);
}
