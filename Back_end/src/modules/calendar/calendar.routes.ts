import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { getReminders, createReminder, updateReminder, deleteReminder } from './calendar.controller';

const calendarRouter = Router();

calendarRouter.use(authenticate);

calendarRouter.get('/', getReminders);
calendarRouter.post('/', createReminder);
calendarRouter.put('/:id', updateReminder);
calendarRouter.delete('/:id', deleteReminder);

export { calendarRouter };
