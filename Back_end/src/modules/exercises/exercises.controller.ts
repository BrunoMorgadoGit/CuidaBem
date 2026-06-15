import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { exercisesService } from './exercises.service';
import type { ExerciseIdParamDto } from './exercises.schema';

export async function listExercises(_req: Request, res: Response): Promise<void> {
  const exercises = await exercisesService.findAll();
  sendSuccess(res, exercises, `${exercises.length} exercício(s) encontrado(s).`);
}

export async function getExercise(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as ExerciseIdParamDto;
  const exercise = await exercisesService.findById(id);
  sendSuccess(res, exercise, 'Exercício carregado com sucesso.');
}
