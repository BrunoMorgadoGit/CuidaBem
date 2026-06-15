import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { contactsService } from './contacts.service';
import type {
  CreateSupportContactDto,
  SupportContactIdParamDto,
  SupportContactQueryDto,
  UpdateSupportContactDto,
} from './contacts.schema';

export function listEmergencyContacts(_req: Request, res: Response): void {
  const contacts = contactsService.findEmergencyContacts();
  res.status(200).json(contacts);
}

export async function listSupportContacts(req: Request, res: Response): Promise<void> {
  const { patientId } = req.validatedQuery as SupportContactQueryDto;
  const contacts = await contactsService.findSupportContacts(patientId, req.user!.sub);
  sendSuccess(res, contacts, `${contacts.length} contato(s) de apoio encontrado(s).`);
}

export async function createSupportContact(req: Request, res: Response): Promise<void> {
  const dto = req.body as CreateSupportContactDto;
  const contact = await contactsService.createSupportContact(dto, req.user!.sub);
  sendSuccess(res, contact, 'Contato de apoio criado com sucesso.', 201);
}

export async function updateSupportContact(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as SupportContactIdParamDto;
  const dto = req.body as UpdateSupportContactDto;
  const contact = await contactsService.updateSupportContact(id, dto, req.user!.sub);
  sendSuccess(res, contact, 'Contato de apoio atualizado com sucesso.');
}

export async function deleteSupportContact(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as SupportContactIdParamDto;
  const result = await contactsService.deleteSupportContact(id, req.user!.sub);
  sendSuccess(res, result, 'Contato de apoio removido com sucesso.');
}
