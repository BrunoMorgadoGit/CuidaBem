import { Request, Response } from 'express';
import { calendarService } from './calendar.service';
import { patientService } from '../patients/patient.service';
import { sendSuccess } from '../../shared/utils/response.helper';

export async function getReminders(req: Request, res: Response): Promise<void> {
  let patientId = req.query.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const reminders = await calendarService.getReminders(req.user!.sub, patientId);
  sendSuccess(res, reminders, 'Lembretes do calendário carregados com sucesso.');
}

export async function createReminder(req: Request, res: Response): Promise<void> {
  let patientId = req.body.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const reminder = await calendarService.createReminder(req.user!.sub, patientId, req.body);
  sendSuccess(res, reminder, 'Lembrete criado com sucesso.', 201);
}

export async function updateReminder(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const reminder = await calendarService.updateReminder(req.user!.sub, id, req.body);
  sendSuccess(res, reminder, 'Lembrete atualizado com sucesso.');
}

export async function deleteReminder(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const result = await calendarService.deleteReminder(req.user!.sub, id);
  sendSuccess(res, result, 'Lembrete removido com sucesso.');
}
