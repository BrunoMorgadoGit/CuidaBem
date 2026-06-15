import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createTask, deleteTask, getTasks, toggleTaskStatus } from './tasks.controller';
import { CreateTaskSchema, TaskIdParamSchema } from './tasks.schema';

const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get('/', getTasks);
tasksRouter.post('/', validate(CreateTaskSchema), createTask);
tasksRouter.patch('/:id/toggle', validate(TaskIdParamSchema, 'params'), toggleTaskStatus);
tasksRouter.delete('/:id', validate(TaskIdParamSchema, 'params'), deleteTask);

export { tasksRouter };
