import { prisma } from '../../config/database';
import { patientService } from '../patients/patient.service';
import type { CreateTaskDto } from './tasks.schema';

export class TasksService {
  private async logActivity(
    patientId: string,
    userId: string,
    action: string,
    description: string,
    taskId?: string,
    details?: any
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    await prisma.activityLog.create({
      data: {
        patientId,
        taskId,
        action,
        description,
        performedByUserId: userId,
        performedByName: user.name,
        performedByRole: user.role,
        details: details || {},
      },
    });
  }

  async getTasks(userId: string, patientId: string) {
    await patientService.ensureAccess(userId, patientId);

    return prisma.task.findMany({
      where: { patientId },
      orderBy: { time: 'asc' },
    });
  }

  async createTask(userId: string, patientId: string, dto: CreateTaskDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    await patientService.ensureAccess(userId, patientId);

    const task = await prisma.task.create({
      data: {
        patientId,
        title: dto.title,
        detail: dto.detail || `Previsto para ${dto.time}`,
        time: dto.time,
        category: dto.category,
        priority: dto.priority,
        status: 'next',
        icon: this.getCategoryIcon(dto.category),
        guideRoute: dto.guideRoute,
        createdByUserId: userId,
      },
    });

    await this.logActivity(
      patientId,
      userId,
      'created_task',
      `${user.name} adicionou a tarefa "${task.title}" para ${task.time}.`,
      task.id,
      { category: task.category, priority: task.priority }
    );

    return task;
  }

  async toggleTaskStatus(userId: string, taskId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('TASK_NOT_FOUND');

    await patientService.ensureAccess(userId, task.patientId);

    const wasDone = task.status === 'done';
    let newStatus = 'next';
    let completedByUserId: string | null = null;
    let completedAt: Date | null = null;

    if (wasDone) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [taskHour, taskMinute] = task.time.split(':').map(Number);
      const isLate = currentHour > taskHour || (currentHour === taskHour && currentMinute >= taskMinute);
      newStatus = isLate ? 'late' : 'next';
    } else {
      newStatus = 'done';
      completedByUserId = userId;
      completedAt = new Date();
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completedByUserId,
        completedAt,
      },
    });

    await this.logActivity(
      task.patientId,
      userId,
      wasDone ? 'uncompleted_task' : 'completed_task',
      wasDone
        ? `${user.name} desmarcou a tarefa "${task.title}".`
        : `${user.name} marcou a tarefa "${task.title}" como concluida.`,
      task.id
    );

    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('USER_NOT_FOUND');

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('TASK_NOT_FOUND');

    await patientService.ensureAccess(userId, task.patientId);

    await prisma.task.delete({ where: { id: taskId } });

    await this.logActivity(
      task.patientId,
      userId,
      'deleted_task',
      `${user.name} removeu a tarefa "${task.title}".`,
      task.id
    );

    return { id: taskId, deleted: true };
  }

  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      medication: 'medical-outline',
      hydration: 'water-outline',
      hygiene: 'bed-outline',
      exercise: 'fitness-outline',
      wellness: 'heart-outline',
      observation: 'document-text-outline',
      routine: 'checkmark-circle-outline',
      exam: 'document-text-outline',
      therapy: 'fitness-outline',
    };
    return icons[category] || 'checkmark-circle-outline';
  }
}

export const tasksService = new TasksService();
