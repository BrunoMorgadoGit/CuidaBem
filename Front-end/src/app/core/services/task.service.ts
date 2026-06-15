import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

import { MOCK_SCHEDULE } from '../data/care.mock';
import type { Task, TaskCategory, TaskDraft, TaskPriority, TaskStatus, TaskTemplate } from '../models';

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  medication: 'medical-outline',
  hydration: 'water-outline',
  hygiene: 'bed-outline',
  exercise: 'fitness-outline',
  wellness: 'heart-outline',
  observation: 'document-text-outline',
  routine: 'checkmark-circle-outline',
  exam: 'document-text-outline',
  therapy: 'fitness-outline'
};

const CATEGORY_ROUTES: Partial<Record<TaskCategory, string>> = {
  medication: '/guia/administracao-de-medicacao',
  hydration: '/guia/controle-de-hidratacao',
  hygiene: '/guia/banho-de-leito',
  exercise: '/tabs/health',
  wellness: '/tabs/profile'
};

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  { id: 'tpl-medication', title: 'Medicacao', category: 'medication', icon: 'medical-outline', guideRoute: '/guia/administracao-de-medicacao' },
  { id: 'tpl-hydration', title: 'Hidratacao', category: 'hydration', icon: 'water-outline', guideRoute: '/guia/controle-de-hidratacao' },
  { id: 'tpl-bed-bath', title: 'Banho no leito', category: 'hygiene', icon: 'bed-outline', guideRoute: '/guia/banho-de-leito' },
  { id: 'tpl-diaper', title: 'Troca de fralda', category: 'hygiene', icon: 'bed-outline', guideRoute: '/guia/troca-de-fralda' },
  { id: 'tpl-exercises', title: 'Exercicios leves', category: 'exercise', icon: 'fitness-outline', guideRoute: '/tabs/health' },
  { id: 'tpl-wellbeing', title: 'Bem-estar', category: 'wellness', icon: 'heart-outline', guideRoute: '/tabs/profile' },
  { id: 'tpl-checkin', title: 'Check-in', category: 'wellness', icon: 'heart-outline', guideRoute: '/tabs/profile' },
  { id: 'tpl-observation', title: 'Observacao', category: 'observation', icon: 'document-text-outline' },
  { id: 'tpl-feeding', title: 'Alimentacao assistida', category: 'routine', icon: 'checkmark-circle-outline', guideRoute: '/guia/alimentacao-assistida' }
];

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);

  private todayTasks: Task[] = [];
  private loadedPatientId = '';

  getTodayTasks(): Task[] {
    return this.todayTasks;
  }

  clearLocalState(): void {
    this.todayTasks = [];
    this.loadedPatientId = '';
  }

  getSchedule(): readonly Task[] {
    return MOCK_SCHEDULE;
  }

  getTaskTemplates(): readonly TaskTemplate[] {
    return TASK_TEMPLATES;
  }

  loadTodayTasks(patientId: string): Observable<Task[]> {
    this.switchPatient(patientId);

    return this.http.get<any>(`${environment.apiUrl}/tasks?patientId=${patientId}`).pipe(
      map((res) => {
        const items = res.data || [];
        return this.dedupeTasks(items.map((item: any) => this.mapTask(item)));
      }),
      tap((mapped) => {
        this.todayTasks = mapped;
      })
    );
  }

  addTask(draft: TaskDraft, elderlyId: string): Observable<Task> {
    this.switchPatient(elderlyId);

    const payload = {
      patientId: elderlyId,
      title: draft.title,
      detail: draft.detail || `Previsto para ${draft.time}`,
      time: draft.time,
      category: draft.category,
      priority: draft.priority,
      guideRoute: draft.guideRoute || CATEGORY_ROUTES[draft.category]
    };

    return this.http.post<any>(`${environment.apiUrl}/tasks`, payload).pipe(
      map((res) => this.mapTask(res.data)),
      tap((task) => {
        this.todayTasks = this.upsertTask(this.todayTasks, task);
      })
    );
  }

  toggleTaskStatus(taskId: string): Observable<Task> {
    return this.http.patch<any>(`${environment.apiUrl}/tasks/${taskId}/toggle`, {}).pipe(
      map((res) => this.mapTask(res.data)),
      tap((updatedTask) => {
        this.todayTasks = this.todayTasks.map((task) => task.id === taskId ? updatedTask : task);
        this.todayTasks = this.dedupeTasks(this.todayTasks);
      })
    );
  }

  deleteTask(taskId: string): Observable<boolean> {
    return this.http.delete<any>(`${environment.apiUrl}/tasks/${taskId}`).pipe(
      map((res) => {
        if (!res.data?.deleted) {
          throw new Error('DELETE_TASK_FAILED');
        }
        return true;
      }),
      tap((success) => {
        if (success) {
          this.todayTasks = this.todayTasks.filter((t) => t.id !== taskId);
        }
      })
    );
  }

  private mapTask(item: any): Task {
    return {
      id: item.id,
      elderlyId: item.patientId,
      title: item.title,
      detail: item.detail,
      time: item.time,
      category: item.category as TaskCategory,
      priority: item.priority as TaskPriority,
      status: item.status as TaskStatus,
      icon: item.icon,
      guideId: item.guideId || undefined,
      guideRoute: item.guideRoute || undefined,
      createdByUserId: item.createdByUserId,
      createdAt: item.createdAt,
      completedByUserId: item.completedByUserId || undefined,
      completedAt: item.completedAt || undefined
    };
  }

  private switchPatient(patientId: string): void {
    if (this.loadedPatientId !== patientId) {
      this.loadedPatientId = patientId;
      this.todayTasks = [];
    }
  }

  private upsertTask(tasks: Task[], nextTask: Task): Task[] {
    const existingIndex = tasks.findIndex((task) => task.id === nextTask.id);
    if (existingIndex === -1) {
      return this.dedupeTasks([...tasks, nextTask]);
    }

    return this.dedupeTasks(tasks.map((task) => task.id === nextTask.id ? nextTask : task));
  }

  private dedupeTasks(tasks: Task[]): Task[] {
    const uniqueTasks = new Map<string, Task>();
    for (const task of tasks) {
      uniqueTasks.set(task.id, task);
    }
    return Array.from(uniqueTasks.values());
  }
}
