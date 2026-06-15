import { Request, Response } from 'express';
import { tasksService } from './tasks.service';
import { patientService } from '../patients/patient.service';
import { sendSuccess } from '../../shared/utils/response.helper';
import type { CreateTaskDto, TaskIdParamDto } from './tasks.schema';

export async function getTasks(req: Request, res: Response): Promise<void> {
  let patientId = req.query.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const tasks = await tasksService.getTasks(req.user!.sub, patientId);
  sendSuccess(res, tasks, 'Tarefas carregadas com sucesso.');
}

export async function createTask(req: Request, res: Response): Promise<void> {
  let patientId = req.body.patientId || req.query.patientId as string;
  if (!patientId) {
    const currentPatient = await patientService.getCurrent(req.user!.sub);
    patientId = currentPatient!.id;
  }
  const task = await tasksService.createTask(req.user!.sub, patientId, req.body as CreateTaskDto);
  sendSuccess(res, task, 'Tarefa criada com sucesso.', 201);
}

export async function toggleTaskStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as TaskIdParamDto;
  const task = await tasksService.toggleTaskStatus(req.user!.sub, id);
  sendSuccess(res, task, 'Status da tarefa atualizado com sucesso.');
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { id } = req.params as unknown as TaskIdParamDto;
  const result = await tasksService.deleteTask(req.user!.sub, id);
  sendSuccess(res, result, 'Tarefa removida com sucesso.');
}
