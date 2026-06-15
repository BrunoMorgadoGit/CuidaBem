import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { limitadorAcessoLogin, limitadorCriacaoConta } from '../../config/limitador-requisicoes.config';
import { getMe, login, logout, refresh, register } from './auth.controller';
import { LoginSchema, LogoutSchema, RefreshSchema, RegisterSchema } from './auth.schema';

const authRouter = Router();

authRouter.post('/register', limitadorCriacaoConta, validate(RegisterSchema), register);
authRouter.post('/login', limitadorAcessoLogin, validate(LoginSchema), login);
authRouter.post('/refresh', validate(RefreshSchema), refresh);
authRouter.post('/logout', authenticate, validate(LogoutSchema), logout);
authRouter.get('/me', authenticate, getMe);

export { authRouter };
