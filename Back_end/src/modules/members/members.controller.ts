import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { membersService } from './members.service';
import type { CreateMemberDto, MemberIdParamDto, PatientParamDto, UpdateMemberDto } from './members.schema';

export async function listMembers(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as PatientParamDto;
  const members = await membersService.list(id, req.user!.sub);
  sendSuccess(res, members, `${members.length} membro(s) encontrado(s).`);
}

export async function createMember(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as PatientParamDto;
  const member = await membersService.create(id, req.user!.sub, req.body as CreateMemberDto);
  sendSuccess(res, member, 'Membro vinculado com sucesso.', 201);
}

export async function updateMember(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as MemberIdParamDto;
  const member = await membersService.update(id, req.user!.sub, req.body as UpdateMemberDto);
  sendSuccess(res, member, 'Membro atualizado com sucesso.');
}

export async function deleteMember(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as MemberIdParamDto;
  const result = await membersService.delete(id, req.user!.sub);
  sendSuccess(res, result, 'Membro removido com sucesso.');
}
