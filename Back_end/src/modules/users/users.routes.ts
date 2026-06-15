import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { getMe, updateMe } from './users.controller';
import { UpdateMeSchema } from './users.schema';

const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get('/me', getMe);
usersRouter.patch('/me', validate(UpdateMeSchema), updateMe);

export { usersRouter };
