import { prisma } from '../../config/database';
import { patientService } from '../patients/patient.service';

export class CalendarService {
  async getReminders(userId: string, patientId: string) {
    await patientService.ensureAccess(userId, patientId);
    return prisma.calendarReminder.findMany({
      where: { patientId },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });
  }

  async createReminder(userId: string, patientId: string, data: any) {
    await patientService.ensureAccess(userId, patientId);
    return prisma.calendarReminder.create({
      data: {
        patientId,
        title: data.title,
        category: data.category,
        date: data.date,
        time: data.time,
        repeat: data.repeat || 'none',
        priority: data.priority || 'normal',
        notes: data.notes || '',
        status: data.status || 'pending',
      }
    });
  }

  async updateReminder(userId: string, id: string, data: any) {
    const reminder = await prisma.calendarReminder.findUnique({ where: { id } });
    if (!reminder) throw new Error('REMINDER_NOT_FOUND');

    await patientService.ensureAccess(userId, reminder.patientId);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.time !== undefined) updateData.time = data.time;
    if (data.repeat !== undefined) updateData.repeat = data.repeat;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'completed') {
        updateData.completedAt = new Date();
        updateData.completedBy = data.completedBy || 'Cuidador';
      } else {
        updateData.completedAt = null;
        updateData.completedBy = null;
      }
    }

    return prisma.calendarReminder.update({
      where: { id },
      data: updateData
    });
  }

  async deleteReminder(userId: string, id: string) {
    const reminder = await prisma.calendarReminder.findUnique({ where: { id } });
    if (!reminder) throw new Error('REMINDER_NOT_FOUND');

    await patientService.ensureAccess(userId, reminder.patientId);

    await prisma.calendarReminder.delete({ where: { id } });
    return { id, deleted: true };
  }
}

export const calendarService = new CalendarService();
