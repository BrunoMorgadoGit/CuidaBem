import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of, switchMap } from 'rxjs';

import type { ActivityLog, EmergencyContact, Patient, Task, TaskDraft, TaskStatus, TaskTemplate } from '../../../core/models';
import { ActivityLogService, EmergencyService, PatientService, TaskService } from '../../../core/services';
import { CalendarService } from '../../calendar/services/calendar.service';
import { CalendarReminder } from '../../calendar/models/calendar.models';
import type { HomeRiskSummary } from '../models';

const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  done: 'Concluida',
  next: 'Pendente',
  late: 'Atencao'
};

const TASK_ICON_LABELS: Record<string, string> = {
  'medical-outline': 'RX',
  'water-outline': 'H2O',
  'bed-outline': 'BED',
  'fitness-outline': 'EX',
  'heart-outline': 'BE',
  'document-text-outline': 'OB',
  'checkmark-circle-outline': 'RT'
};

const PRACTICAL_GUIDE_ROUTE_PREFIX = '/guia-pratico';

const HOME_TASK_GUIDE_SLUGS = new Map<string, string>([
  ['banho no leito', 'banho-de-leito'],
  ['banho de leito', 'banho-de-leito'],
  ['banho-leito', 'banho-de-leito'],
  ['banho-de-leito', 'banho-de-leito'],
  ['troca de fralda', 'troca-de-fralda'],
  ['troca de fraldas', 'troca-de-fralda'],
  ['troca-fraldas', 'troca-de-fralda'],
  ['troca-de-fralda', 'troca-de-fralda'],
  ['higiene bucal', 'higiene-bucal'],
  ['higiene-bucal', 'higiene-bucal'],
  ['prevencao de assaduras', 'prevencao-assaduras'],
  ['prevencao-assaduras', 'prevencao-assaduras'],
  ['prevencao-de-assaduras', 'prevencao-assaduras'],
  ['prevencao de quedas', 'prevencao-quedas'],
  ['prevencao-quedas', 'prevencao-quedas'],
  ['prevencao-de-quedas', 'prevencao-quedas'],
  ['mobilidade', 'mobilidade'],
  ['exercicios leves', 'mobilidade'],
  ['posicionamento', 'posicionamento'],
  ['prevencao de lesoes', 'prevencao-de-lesoes'],
  ['prevencao-de-lesoes', 'prevencao-de-lesoes'],
  ['observacao', 'registro-do-cuidado'],
  ['registro do cuidado', 'registro-do-cuidado'],
  ['registro-cuidado', 'registro-do-cuidado'],
  ['registro-do-cuidado', 'registro-do-cuidado']
]);

const BLOCKED_HOME_TASK_GUIDE_SLUGS = new Set([
  'administracao-de-medicacao',
  'controle-de-hidratacao',
  'hidratacao',
  'medicacao',
  'check-in',
  'bem-estar',
  'alimentacao-assistida'
]);

function normalizeGuideLookupKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function extractTaskGuideSlug(routeOrSlug?: string | null): string | null {
  if (!routeOrSlug) {
    return null;
  }

  const normalized = routeOrSlug.trim().toLowerCase();
  const routeMatch = normalized.match(/\/(?:guia-pratico|guia)\/([^/?#]+)/);
  const rawSlug = routeMatch ? routeMatch[1] : normalized.replace(/^\/+/, '');
  const slug = rawSlug.split(/[?#]/)[0];

  return slug || null;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private readonly patientService = inject(PatientService);
  private readonly taskService = inject(TaskService);
  private readonly emergencyService = inject(EmergencyService);
  private readonly activityLogService = inject(ActivityLogService);
  private readonly calendarService = inject(CalendarService);

  loadAllData(): Observable<any> {
    return this.patientService.loadCurrentPatient().pipe(
      switchMap((patientRes) => {
        const patientId = patientRes.data.id;
        return forkJoin({
          tasks: this.taskService.loadTodayTasks(patientId),
          logs: this.activityLogService.loadLogs(patientId),
          reminders: this.calendarService.loadReminders(patientId).pipe(
            catchError((err) => {
              console.error('Error loading calendar reminders:', err);
              return of([]);
            })
          ),
          emergency: this.emergencyService.loadEmergencyContacts().pipe(
            catchError((err) => {
              console.error('Error loading emergency contacts:', err);
              return of([]);
            })
          ),
          support: this.emergencyService.loadSupportContacts(patientId).pipe(
            catchError((err) => {
              console.error('Error loading support contacts:', err);
              return of([]);
            })
          )
        });
      })
    );
  }

  getPatient(): Patient {
    return this.patientService.getCurrentPatient();
  }

  getTodayTasks(): Task[] {
    return this.taskService.getTodayTasks();
  }

  getEmergencyContacts(): readonly EmergencyContact[] {
    return this.emergencyService.getEmergencyContacts();
  }

  getRiskSummary(): HomeRiskSummary {
    const tasks = this.getTodayTasks();
    const completedTasks = tasks.filter((task) => task.status === 'done').length;
    const lateTasks = tasks.filter((task) => task.status === 'late').length;
    const totalTasks = tasks.length;

    let currentLabel = 'Idoso estável';
    let currentTone: 'success' | 'warning' | 'danger' = 'success';
    if (lateTasks >= 3) {
      currentLabel = 'Risco Elevado';
      currentTone = 'danger';
    } else if (lateTasks > 0) {
      currentLabel = 'Atenção Leve';
      currentTone = 'warning';
    }

    return {
      completedTasks,
      totalTasks,
      percent: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      label: currentLabel,
      tone: currentTone
    };
  }

  getAttentionTasks(): Task[] {
    return this.getTodayTasks().filter((task) => task.status === 'late');
  }

  getTodayCalendarReminders(): CalendarReminder[] {
    const todayStr = new Date().toLocaleDateString('en-CA');
    return this.calendarService.getAllReminders().filter(r => r.date === todayStr);
  }

  toggleReminderStatus(id: string, currentStatus: string): void {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    this.calendarService.updateReminder(id, {
      status: nextStatus,
      completedBy: nextStatus === 'completed' ? 'Cuidador' : undefined
    });
  }

  deleteReminder(id: string): void {
    this.calendarService.deleteReminder(id);
  }

  getRecentActivity(): ActivityLog[] {
    const patient = this.getPatient();
    return this.activityLogService.getRecentLogs(patient.id, 5);
  }

  getTaskTemplates(): readonly TaskTemplate[] {
    return this.taskService.getTaskTemplates();
  }

  hasPracticalGuide(task: Task): boolean {
    return this.getGuideSlugByTask(task) !== null;
  }

  getPracticalGuideRoute(task: Task): string | null {
    const slug = this.getGuideSlugByTask(task);
    return slug ? `${PRACTICAL_GUIDE_ROUTE_PREFIX}/${slug}` : null;
  }

  getGuideSlugByTask(task: Task): string | null {
    const routeSlug = extractTaskGuideSlug(task.guideRoute);
    if (routeSlug) {
      if (BLOCKED_HOME_TASK_GUIDE_SLUGS.has(routeSlug)) {
        return null;
      }

      const mappedRouteSlug = HOME_TASK_GUIDE_SLUGS.get(routeSlug);
      if (mappedRouteSlug) {
        return mappedRouteSlug;
      }
    }

    const titleKey = normalizeGuideLookupKey(task.title);
    if (BLOCKED_HOME_TASK_GUIDE_SLUGS.has(titleKey)) {
      return null;
    }

    return HOME_TASK_GUIDE_SLUGS.get(titleKey) ?? null;
  }

  addTask(draft: TaskDraft): Observable<Task> {
    const patient = this.getPatient();
    return this.taskService.addTask(draft, patient.id);
  }

  toggleTaskStatus(taskId: string): Observable<Task> {
    return this.taskService.toggleTaskStatus(taskId);
  }

  deleteTask(taskId: string): Observable<boolean> {
    return this.taskService.deleteTask(taskId);
  }

  reloadActivity(): Observable<ActivityLog[]> {
    const patient = this.getPatient();
    return this.activityLogService.loadLogs(patient.id);
  }

  getActivityLabel(log: ActivityLog): string {
    return this.activityLogService.formatHomeActivityTitle(log);
  }

  getActivitySummary(log: ActivityLog): string {
    return this.activityLogService.formatActivitySummary(log);
  }

  getActivityIcon(log: ActivityLog): string {
    return this.activityLogService.getActivityIcon(log);
  }

  getActivityTone(log: ActivityLog): string {
    return this.activityLogService.getActivityTone(log);
  }

  getTaskStatusLabel(status: TaskStatus): string {
    return TASK_STATUS_LABELS[status];
  }

  getTaskIconLabel(icon: string): string {
    return TASK_ICON_LABELS[icon] ?? 'OK';
  }

  getPriorityTone(index: number): 'neutral' | 'orange' | 'green' {
    if (index === 0) {
      return 'neutral';
    }

    return index < 3 ? 'orange' : 'green';
  }
}
