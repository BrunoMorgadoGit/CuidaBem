import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  createPatient,
  deletePatient,
  getCurrentPatient,
  getPatient,
  listPatients,
  updatePatient,
} from './patient.controller';
import { CreatePatientSchema, PatientIdParamSchema, UpdatePatientSchema } from './patient.schema';

const patientRouter = Router();

patientRouter.use(authenticate);
patientRouter.get('/current', getCurrentPatient);
patientRouter.get('/', listPatients);
patientRouter.get('/:id', validate(PatientIdParamSchema, 'params'), getPatient);
patientRouter.post('/', validate(CreatePatientSchema), createPatient);
patientRouter.patch('/:id', validate(PatientIdParamSchema, 'params'), validate(UpdatePatientSchema), updatePatient);
patientRouter.delete('/:id', validate(PatientIdParamSchema, 'params'), deletePatient);

export { patientRouter };
