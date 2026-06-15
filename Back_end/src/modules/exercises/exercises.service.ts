import { prisma } from '../../config/database';

function toStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function mapExercise(exercise: any) {
  return {
    id: exercise.id,
    title: exercise.titulo,
    category: exercise.categoria,
    icon: exercise.icone,
    sets: exercise.series,
    reps: exercise.repeticoes,
    description: exercise.descricao,
    videoUrl: exercise.url_video ?? '',
    steps: toStringArray(exercise.passos),
    precautions: toStringArray(exercise.cuidados),
    completedToday: false,
    tone: exercise.tom,
  };
}

export class ExercisesService {
  async findAll() {
    const exercises = await prisma.$queryRaw<any[]>`
      SELECT
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
        tom
      FROM exercise
      WHERE ativo = true
      ORDER BY ordem ASC
    `;

    return exercises.map(mapExercise);
  }

  async findById(id: string) {
    const exercises = await prisma.$queryRaw<any[]>`
      SELECT
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
        ativo
      FROM exercise
      WHERE id = ${id}
      LIMIT 1
    `;
    const exercise = exercises[0];
    if (!exercise || !exercise.ativo) throw new Error('EXERCISE_NOT_FOUND');
    return mapExercise(exercise);
  }
}

export const exercisesService = new ExercisesService();
