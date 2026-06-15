import { Request, Response } from 'express';
import { activityLogsService } from './activity-logs.service';
import { patientService } from '../patients/patient.service';
import { sendSuccess } from '../../shared/utils/response.helper';

export async function getLogs(req: Request, res: Response): Promise<void> {
  let patientId = req.query.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const logs = await activityLogsService.getLogs(req.user!.sub, patientId);
  sendSuccess(res, logs, 'Logs de atividade carregados com sucesso.');
}

export async function clearLogs(req: Request, res: Response): Promise<void> {
  let patientId = req.body.patientId || req.query.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const result = await activityLogsService.clearLogs(req.user!.sub, patientId);
  sendSuccess(res, result, 'Logs de atividade limpos com sucesso.');
}
