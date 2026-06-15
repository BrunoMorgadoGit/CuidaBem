import { prisma } from '../../config/database';
import { patientService } from '../patients/patient.service';

export class ActivityLogsService {
  async getLogs(userId: string, patientId: string) {
    await patientService.ensureAccess(userId, patientId);

    return prisma.activityLog.findMany({
      where: { patientId },
      orderBy: { performedAt: 'desc' },
    });
  }

  async clearLogs(userId: string, patientId: string) {
    await patientService.ensureAccess(userId, patientId);

    await prisma.activityLog.deleteMany({
      where: { patientId },
    });
    return { success: true };
  }
}

export const activityLogsService = new ActivityLogsService();
