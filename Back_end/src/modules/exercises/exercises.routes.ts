import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate.middleware';
import { getExercise, listExercises } from './exercises.controller';
import { ExerciseIdParamSchema } from './exercises.schema';

const exercisesRouter = Router();

exercisesRouter.get('/', listExercises);
exercisesRouter.get('/:id', validate(ExerciseIdParamSchema, 'params'), getExercise);

export { exercisesRouter };
