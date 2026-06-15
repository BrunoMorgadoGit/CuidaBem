import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import {
  createSupportContact,
  deleteSupportContact,
  listEmergencyContacts,
  listSupportContacts,
  updateSupportContact,
} from './contacts.controller';
import {
  CreateSupportContactSchema,
  SupportContactIdParamSchema,
  SupportContactQuerySchema,
  UpdateSupportContactSchema,
} from './contacts.schema';

const emergencyContactsRouter = Router();
const supportContactsRouter = Router();

emergencyContactsRouter.get('/', listEmergencyContacts);

supportContactsRouter.use(authenticate);
supportContactsRouter.get('/', validate(SupportContactQuerySchema, 'query'), listSupportContacts);
supportContactsRouter.post('/', validate(CreateSupportContactSchema), createSupportContact);
supportContactsRouter.patch(
  '/:id',
  validate(SupportContactIdParamSchema, 'params'),
  validate(UpdateSupportContactSchema),
  updateSupportContact
);
supportContactsRouter.delete('/:id', validate(SupportContactIdParamSchema, 'params'), deleteSupportContact);

export { emergencyContactsRouter, supportContactsRouter };
