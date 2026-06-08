import { Router } from 'express';
import { register, login, getMe, updateProfile } from './auth.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { LoginSchema, RegisterSchema, UpdateProfileSchema } from './auth.schema';

const authRouter = Router();

authRouter.post('/register', validate(RegisterSchema), register);
authRouter.post('/login', validate(LoginSchema), login);
authRouter.get('/me', authenticate, getMe);
authRouter.put('/me', authenticate, validate(UpdateProfileSchema), updateProfile);

export { authRouter };
