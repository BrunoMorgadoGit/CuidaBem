import { Request, Response } from 'express';
import { sendSuccess } from '../../shared/utils/response.helper';
import { patientService } from './patient.service';
import type { CreatePatientDto, PatientIdParamDto, UpdatePatientDto } from './patient.schema';

export async function getCurrentPatient(req: Request, res: Response): Promise<void> {
  const patient = await patientService.getCurrent(req.user!.sub);
  sendSuccess(res, patient, 'Paciente atual carregado com sucesso.');
}

export async function listPatients(req: Request, res: Response): Promise<void> {
  const patients = await patientService.findAll(req.user!.sub);
  sendSuccess(res, patients, `${patients.length} paciente(s) encontrado(s).`);
}

export async function getPatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as PatientIdParamDto;
  const patient = await patientService.findById(req.user!.sub, id);
  sendSuccess(res, patient, 'Paciente carregado com sucesso.');
}

export async function createPatient(req: Request, res: Response): Promise<void> {
  const patient = await patientService.create(req.user!.sub, req.body as CreatePatientDto);
  sendSuccess(res, patient, 'Paciente criado com sucesso.', 201);
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as PatientIdParamDto;
  const patient = await patientService.update(req.user!.sub, id, req.body as UpdatePatientDto);
  sendSuccess(res, patient, 'Paciente atualizado com sucesso.');
}

export async function deletePatient(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as PatientIdParamDto;
  const result = await patientService.delete(req.user!.sub, id);
  sendSuccess(res, result, 'Paciente removido com sucesso.');
}
