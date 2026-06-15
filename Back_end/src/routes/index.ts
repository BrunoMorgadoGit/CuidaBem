import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { usersRouter } from '../modules/users/users.routes';
import { patientRouter } from '../modules/patients/patient.routes';
import { membersRouter, patientMembersRouter } from '../modules/members/members.routes';
import { contentGuidesRouter } from '../modules/content-guides/content-guides.routes';
import { tutorialVideosRouter } from '../modules/tutorial-videos/tutorial-videos.routes';
import { exercisesRouter } from '../modules/exercises/exercises.routes';
import { emergencyContactsRouter, supportContactsRouter } from '../modules/contacts/contacts.routes';
import { healthRouter } from '../modules/health/health.routes';
import { uploadRouter } from '../modules/upload/upload.routes';
import { educationalRouter } from '../modules/educational/educational.routes';
import { tasksRouter } from '../modules/tasks/tasks.routes';
import { activityLogsRouter } from '../modules/activity-logs/activity-logs.routes';
import { healthAiRouter } from '../modules/health-ai/health-ai.routes';
import { calendarRouter } from '../modules/calendar/calendar.routes';

const router = Router();

router.use('/api/auth', authRouter);
router.use('/api/users', usersRouter);
router.use('/api/patients', patientMembersRouter);
router.use('/api/patients', patientRouter);
router.use('/api/members', membersRouter);
router.use('/api/guides', contentGuidesRouter);
router.use('/api/tutorial-videos', tutorialVideosRouter);
router.use('/api/exercises', exercisesRouter);
router.use('/api/emergency-contacts', emergencyContactsRouter);
router.use('/api/support-contacts', supportContactsRouter);
router.use('/api/health', healthRouter);
router.use('/api/uploads', uploadRouter);
router.use('/api/educational', educationalRouter);
router.use('/api/tasks', tasksRouter);
router.use('/api/activity-logs', activityLogsRouter);
router.use('/api/health-ai', healthAiRouter);
router.use('/api/calendar', calendarRouter);

export { router };
