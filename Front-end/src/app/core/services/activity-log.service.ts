import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

import type { ActivityAction, ActivityLog } from '../models';
import { UserService } from './user.service';

export type ActivityPeriodFilter = 'today' | 'week' | 'month' | 'all';
export type ActivityGroupFilter = 'all' | 'completed' | 'added' | 'edited' | 'removed' | 'observations';

const HOME_VISIBLE_ACTIONS = new Set<ActivityAction>(['completed_task', 'created_observation', 'check_in']);
const SUMMARY_ACTION_PRIORITY: ActivityAction[] = ['completed_task', 'created_observation', 'check_in'];

const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  created_task: 'Tarefa adicionada',
  completed_task: 'Tarefa concluida',
  uncompleted_task: 'Tarefa desmarcada',
  updated_task: 'Tarefa atualizada',
  deleted_task: 'Tarefa removida',
  created_observation: 'Observacao registrada',
  check_in: 'Check-in realizado'
};

const ACTIVITY_ACTION_GROUP: Record<ActivityAction, ActivityGroupFilter> = {
  created_task: 'added',
  completed_task: 'completed',
  uncompleted_task: 'edited',
  updated_task: 'edited',
  deleted_task: 'removed',
  created_observation: 'observations',
  check_in: 'observations'
};

const ACTIVITY_ACTION_TONE: Record<ActivityAction, string> = {
  created_task: 'blue',
  completed_task: 'green',
  uncompleted_task: 'orange',
  updated_task: 'orange',
  deleted_task: 'red',
  created_observation: 'purple',
  check_in: 'green'
};

const ACTIVITY_ACTION_ICON: Record<ActivityAction, string> = {
  created_task: '+',
  completed_task: '✓',
  uncompleted_task: '↺',
  updated_task: '✎',
  deleted_task: '✕',
  created_observation: '!',
  check_in: '✓'
};

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private logs: ActivityLog[] = [];
  private loadedElderlyId = '';

  getLogs(elderlyId: string): ActivityLog[] {
    return this.logs
      .filter((log) => log.elderlyId === elderlyId)
      .slice()
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
  }

  clearLocalState(): void {
    this.logs = [];
    this.loadedElderlyId = '';
  }

  getRecentLogs(elderlyId: string, limit = 5): ActivityLog[] {
    return summarizeHomeActivityLogs(this.getLogs(elderlyId), limit);
  }

  loadLogs(elderlyId: string): Observable<ActivityLog[]> {
    this.switchElderly(elderlyId);

    return this.http.get<any>(`${environment.apiUrl}/activity-logs?patientId=${elderlyId}`).pipe(
      map((res) => {
        // Map backend patientId field to frontend elderlyId
        const items = res.data || [];
        return items.map((item: any) => ({
          id: item.id,
          elderlyId: item.patientId,
          taskId: item.taskId || undefined,
          action: item.action,
          description: item.description,
          performedByUserId: item.performedByUserId,
          performedByName: item.performedByName,
          performedByRole: item.performedByRole,
          performedAt: item.performedAt,
          details: item.details || undefined
        }));
      }),
      tap((mapped) => {
        this.logs = mapped;
      })
    );
  }

  log(
    elderlyId: string,
    action: ActivityAction,
    description: string,
    taskId?: string,
    details?: Record<string, unknown>
  ): ActivityLog {
    // Keep local log for compatibility if called directly, but we rely on loadLogs() for real data
    this.switchElderly(elderlyId);

    const user = this.userService.getCurrentUser();
    const entry: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      elderlyId,
      taskId,
      action,
      description,
      performedByUserId: user.id,
      performedByName: user.name,
      performedByRole: user.role,
      performedAt: new Date().toISOString(),
      details
    };

    this.logs.unshift(entry);
    return entry;
  }

  clearLogs(elderlyId: string): Observable<any> {
    this.switchElderly(elderlyId);

    return this.http.delete<any>(`${environment.apiUrl}/activity-logs?patientId=${elderlyId}`).pipe(
      tap(() => {
        this.logs = [];
      })
    );
  }

  getActivityLabel(log: ActivityLog): string {
    return ACTIVITY_ACTION_LABELS[log.action];
  }

  getActivityTone(log: ActivityLog): string {
    return ACTIVITY_ACTION_TONE[log.action];
  }

  getActivityIcon(log: ActivityLog): string {
    return ACTIVITY_ACTION_ICON[log.action];
  }

  getActivityGroup(log: ActivityLog): ActivityGroupFilter {
    return ACTIVITY_ACTION_GROUP[log.action];
  }

  isHomeVisibleActivity(log: ActivityLog): boolean {
    return HOME_VISIBLE_ACTIONS.has(log.action);
  }

  formatHomeActivityTitle(log: ActivityLog): string {
    const label = this.getContextualTitle(log);
    return label;
  }

  formatActivitySummary(log: ActivityLog): string {
    const time = formatLogTime(log.performedAt);
    const title = this.getContextualTitle(log);

    if (log.action === 'created_observation') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    if (log.action === 'check_in') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    if (log.action === 'completed_task') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    if (log.action === 'uncompleted_task') {
      return `${title} às ${time}`;
    }

    if (log.action === 'created_task') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    if (log.action === 'updated_task') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    if (log.action === 'deleted_task') {
      return `${title} por ${log.performedByName} às ${time}`;
    }

    return `${title} por ${log.performedByName} às ${time}`;
  }

  getFullHistoryLogs(logs: readonly ActivityLog[], period: ActivityPeriodFilter, group: ActivityGroupFilter): ActivityLog[] {
    return filterActivityLogs(logs, period, group);
  }

  private getContextualTitle(log: ActivityLog): string {
    const extractedTitle = extractQuotedTitle(log.description);
    const title = extractedTitle ?? this.getActivityLabel(log);

    if (log.action === 'completed_task') {
      return getTaskCompletionLabel(title);
    }

    if (log.action === 'created_observation') {
      return 'Observacao importante registrada';
    }

    if (log.action === 'check_in') {
      return 'Check-in realizado';
    }

    if (log.action === 'uncompleted_task') {
      return `Tarefa desmarcada: ${title}`;
    }

    if (log.action === 'created_task') {
      return `Tarefa adicionada: ${title}`;
    }

    if (log.action === 'updated_task') {
      return `Tarefa atualizada: ${title}`;
    }

    if (log.action === 'deleted_task') {
      return `Tarefa removida: ${title}`;
    }

    return title;
  }

  private switchElderly(elderlyId: string): void {
    if (this.loadedElderlyId !== elderlyId) {
      this.loadedElderlyId = elderlyId;
      this.logs = [];
    }
  }
}

export function summarizeHomeActivityLogs(logs: readonly ActivityLog[], limit = 5): ActivityLog[] {
  const result: ActivityLog[] = [];
  const seenTaskIds = new Set<string>();
  const seenLogIds = new Set<string>();

  for (const action of SUMMARY_ACTION_PRIORITY) {
    for (const log of logs) {
      if (result.length >= limit) {
        return result;
      }

      if (seenLogIds.has(log.id)) {
        continue;
      }

      if (log.action !== action) {
        continue;
      }

      if (log.taskId) {
        if (seenTaskIds.has(log.taskId)) {
          continue;
        }
        seenTaskIds.add(log.taskId);
      }

      if (!HOME_VISIBLE_ACTIONS.has(log.action)) {
        continue;
      }

      seenLogIds.add(log.id);
      result.push(log);
    }
  }

  return result
    .slice()
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
    .slice(0, limit);
}

export function filterActivityLogs(logs: readonly ActivityLog[], period: ActivityPeriodFilter, group: ActivityGroupFilter): ActivityLog[] {
  return logs.filter((log) => matchesPeriod(log, period) && matchesGroup(log, group));
}

export function formatLogTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function extractQuotedTitle(description: string): string | null {
  const match = description.match(/"([^"]+)"/);
  return match?.[1] ?? null;
}

function matchesGroup(log: ActivityLog, group: ActivityGroupFilter): boolean {
  if (group === 'all') {
    return true;
  }

  return ACTIVITY_ACTION_GROUP[log.action] === group;
}

function matchesPeriod(log: ActivityLog, period: ActivityPeriodFilter): boolean {
  if (period === 'all') {
    return true;
  }

  const performedAt = new Date(log.performedAt).getTime();
  const now = new Date();
  const start = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    return performedAt >= start.getTime();
  }

  if (period === 'week') {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return performedAt >= start.getTime();
  }

  start.setDate(now.getDate() - 29);
  start.setHours(0, 0, 0, 0);
  return performedAt >= start.getTime();
}

function getTaskCompletionLabel(title: string): string {
  const normalized = title.toLowerCase();

  if (normalized.includes('medic')) {
    return 'Medicação concluída';
  }

  if (normalized.includes('hidrata')) {
    return 'Hidratação registrada';
  }

  if (normalized.includes('aliment')) {
    return 'Alimentação registrada';
  }

  if (normalized.includes('exerc')) {
    return 'Exercício realizado';
  }

  if (normalized.includes('higien') || normalized.includes('banho') || normalized.includes('fralda')) {
    return 'Higiene realizada';
  }

  if (normalized.includes('observ')) {
    return 'Observação importante registrada';
  }

  if (normalized.includes('consult') || normalized.includes('lembrete')) {
    return 'Consulta ou lembrete concluído';
  }

  return 'Tarefa concluída';
}
