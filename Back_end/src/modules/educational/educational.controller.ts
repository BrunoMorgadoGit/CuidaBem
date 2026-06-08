import { Request, Response } from 'express';
import { EducationalService } from './educational.service';
import { educationalRepository } from './educational.repository';
import { sendSuccess } from '../../shared/utils/response.helper';
import { ViolenceType, EmergencyContact } from './educational.model';

const educationalService = new EducationalService(educationalRepository);

export function getAllViolenceTypes(_req: Request, res: Response): void {
  const violenceTypes = educationalService.getAllViolenceTypes();

  sendSuccess<ViolenceType[]>(
    res,
    violenceTypes,
    `${violenceTypes.length} tipos de violência carregados com sucesso.`
  );
}

export function getAllEmergencyContacts(_req: Request, res: Response): void {
  const contacts = educationalService.getAllEmergencyContacts();

  sendSuccess<EmergencyContact[]>(
    res,
    contacts,
    `${contacts.length} canais de proteção carregados com sucesso.`
  );
}
