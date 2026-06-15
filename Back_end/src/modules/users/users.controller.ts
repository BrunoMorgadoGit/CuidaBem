import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { usersService } from './users.service';
import type { UpdateMeDto } from './users.schema';

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = await usersService.getMe(req.user!.sub);
  sendSuccess(res, user, 'Usuário carregado com sucesso.');
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const user = await usersService.updateMe(req.user!.sub, req.body as UpdateMeDto);
  sendSuccess(res, user, 'Usuário atualizado com sucesso.');
}
