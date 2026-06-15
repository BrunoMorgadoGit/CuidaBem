import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { createMember, deleteMember, listMembers, updateMember } from './members.controller';
import { CreateMemberSchema, MemberIdParamSchema, PatientParamSchema, UpdateMemberSchema } from './members.schema';

const patientMembersRouter = Router({ mergeParams: true });
const membersRouter = Router();

patientMembersRouter.use(authenticate);
patientMembersRouter.get('/:id/members', validate(PatientParamSchema, 'params'), listMembers);
patientMembersRouter.post('/:id/members', validate(PatientParamSchema, 'params'), validate(CreateMemberSchema), createMember);

membersRouter.use(authenticate);
membersRouter.patch('/:id', validate(MemberIdParamSchema, 'params'), validate(UpdateMemberSchema), updateMember);
membersRouter.delete('/:id', validate(MemberIdParamSchema, 'params'), deleteMember);

export { membersRouter, patientMembersRouter };
