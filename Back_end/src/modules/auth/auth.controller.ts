import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response.helper';
import type { LoginDto, LogoutDto, RefreshDto, RegisterDto } from './auth.schema';

function getRequestMeta(req: Request) {
  return {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  };
}

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterDto, getRequestMeta(req));
  sendSuccess(res, result, 'Conta criada com sucesso.', 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginDto, getRequestMeta(req));
  sendSuccess(res, result, 'Login realizado com sucesso.');
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const result = await authService.refresh(req.body as RefreshDto, getRequestMeta(req));
  sendSuccess(res, result, 'Token renovado com sucesso.');
}

export async function logout(req: Request, res: Response): Promise<void> {
  const result = await authService.logout(req.user!.sub, req.body as LogoutDto);
  sendSuccess(res, result, 'Logout realizado com sucesso.');
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const result = await authService.getMe(req.user!.sub);
  sendSuccess(res, result, 'Sessão carregada com sucesso.');
}
