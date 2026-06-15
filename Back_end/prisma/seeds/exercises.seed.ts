import { PrismaClient } from '@prisma/client';

const videoOneToFive = 'https://youtu.be/am6W7pn09TM?si=MuIEVJ4O8-BmFSUh';
const videoSixToNine = 'https://youtu.be/vlYwRhz_XMA?si=6Q0G261Y3eUsZU60';
const videoTen = 'https://youtu.be/IXoqKZBnfeM';

const exercises = [
  ['exercise-1-heel-raise', 'Elevar os calcanhares', 'Circulação', 'LEG', 3, '10 repetições', videoOneToFive, 'blue'],
  ['exercise-2-leg-extension', 'Extensão de pernas sentado', 'Força', 'ST', 3, '10 repetições cada perna', videoOneToFive, 'green'],
  ['exercise-3-toe-raise', 'Ponta dos pés com apoio', 'Equilíbrio', 'EQ', 3, '10 repetições', videoOneToFive, 'orange'],
  ['exercise-4-shoulder-rotation', 'Rotação de ombros', 'Mobilidade', 'OMB', 3, '10 círculos', videoOneToFive, 'purple'],
  ['exercise-5-arm-flexion', 'Flexão dos braços sentado', 'Força', 'ARM', 3, '10 repetições', videoOneToFive, 'red'],
  ['exercise-6-chair-hip-lift', 'Tirar o quadril da cadeira', 'Core', 'CORE', 3, '8 a 10 repetições', videoSixToNine, 'cyan'],
  ['exercise-7-ankle-circles', 'Círculos com tornozelos', 'Circulação', 'TOR', 3, '10 círculos cada pé', videoSixToNine, 'blue'],
  ['exercise-8-arm-raise', 'Elevação dos braços', 'Mobilidade', 'BRA', 3, '10 repetições', videoSixToNine, 'purple'],
  ['exercise-9-open-close-hands', 'Abrir e fechar as mãos', 'Mobilidade', 'MAO', 3, '10 repetições', videoSixToNine, 'green'],
  ['exercise-10-side-stretch', 'Alongamento lateral sentado', 'Alongamento', 'AL', 3, '10 segundos cada lado', videoTen, 'orange'],
] as const;

export async function seedExercises(prisma: PrismaClient): Promise<void> {
  for (const [index, exercise] of exercises.entries()) {
    const [id, titulo, categoria, icone, series, repeticoes, url_video, tom] = exercise;
    const descricao = `${titulo} auxilia na mobilidade, circulação e manutenção funcional quando realizado com supervisão.`;
    const passos = JSON.stringify([
      'Posicione a pessoa idosa com segurança.',
      'Explique o movimento antes de começar.',
      'Execute devagar, respeitando limites.',
      'Observe dor, tontura ou cansaço.',
      'Finalize com conforto e hidratação se permitido.',
    ]);
    const cuidados = JSON.stringify([
      'Não realizar em caso de dor intensa.',
      'Interromper se houver tontura ou falta de ar.',
      'Manter supervisão durante todo o exercício.',
    ]);

    await prisma.$executeRaw`
      INSERT INTO exercise (
        id,
        titulo,
        categoria,
        icone,
        series,
        repeticoes,
        descricao,
        url_video,
        passos,
        cuidados,
        tom,
        ordem,
        ativo
      )
      VALUES (
        ${id},
        ${titulo},
        ${categoria},
        ${icone},
        ${series},
        ${repeticoes},
        ${descricao},
        ${url_video},
        ${passos},
        ${cuidados},
        ${tom},
        ${index + 1},
        true
      )
      ON DUPLICATE KEY UPDATE
        titulo = VALUES(titulo),
        categoria = VALUES(categoria),
        icone = VALUES(icone),
        series = VALUES(series),
        repeticoes = VALUES(repeticoes),
        descricao = VALUES(descricao),
        url_video = VALUES(url_video),
        passos = VALUES(passos),
        cuidados = VALUES(cuidados),
        tom = VALUES(tom),
        ordem = VALUES(ordem),
        ativo = VALUES(ativo)
    `;
  }

  console.log(`Exercícios seedados: ${exercises.length}.`);
}
