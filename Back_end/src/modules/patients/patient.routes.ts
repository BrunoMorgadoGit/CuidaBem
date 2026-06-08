import { Router } from 'express';
import { getDashboard, toggleTaskStatus } from './patient.controller';

const patientRouter = Router();

patientRouter.get('/:id/dashboard', getDashboard);
patientRouter.post('/:id/tasks/:taskId/toggle', toggleTaskStatus);

export { patientRouter };
