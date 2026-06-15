import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { clearLogs, getLogs } from './activity-logs.controller';

const activityLogsRouter = Router();

activityLogsRouter.use(authenticate);

activityLogsRouter.get('/', getLogs);
activityLogsRouter.delete('/', clearLogs);

export { activityLogsRouter };
