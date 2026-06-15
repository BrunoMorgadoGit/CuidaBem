import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import type {
  ActivityLog,
  EmergencyContact,
  Task,
  TaskCategory,
  TaskDraft,
  TaskPriority,
  TaskStatus,
  TaskTemplate
} from '../../../core/models';
import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { sanitizeText, trackById } from '../../../shared/utils';
import { HomeService } from '../services/home.service';
import { CalendarReminder } from '../../calendar/models/calendar.models';
import { type UserProfile } from '../../profile/models';
import { ProfileService } from '../../profile/services';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, PageShellComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css']
})
export class HomePage implements OnInit, OnDestroy {
  private readonly homeService = inject(HomeService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  get patient() {
    return this.homeService.getPatient();
  }
  readonly trackByTaskId = trackById<Task>;
  readonly trackByLogId = trackById<ActivityLog>;
  readonly trackByEmergencyContactId = trackById<EmergencyContact>;

  emergencyOpen = false;
  addTaskOpen = false;
  profileSummary: UserProfile = this.profileService.getProfile();

  selectedTemplate: TaskTemplate | null = null;
  taskActionError = '';
  customTitle = '';
  taskTime = '';
  taskCategory: TaskCategory = 'routine';
  taskPriority: TaskPriority = 'normal';
  taskDetail = '';
  addTaskError = '';

  private readonly pendingTaskIds = new Set<string>();
  private profileSubscription?: Subscription;

  readonly categories: { value: TaskCategory; label: string }[] = [
    { value: 'medication', label: 'Medicacao' },
    { value: 'hygiene', label: 'Higiene' },
    { value: 'hydration', label: 'Hidratacao' },
    { value: 'exercise', label: 'Exercicio' },
    { value: 'wellness', label: 'Bem-estar' },
    { value: 'observation', label: 'Observacao' },
    { value: 'routine', label: 'Rotina' }
  ];

  readonly priorities: { value: TaskPriority; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'attention', label: 'Atencao' },
    { value: 'priority', label: 'Prioritario' }
  ];

  ngOnInit(): void {
    this.profileSummary = this.profileService.refreshCurrentProfile();
    this.profileSubscription = this.profileService.profile$.subscribe((profile) => {
      this.profileSummary = profile;
      this.cdr.markForCheck();
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this.profileSubscription?.unsubscribe();
  }

  loadData(): void {
    this.homeService.loadAllData().subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error loading home data:', err);
      }
    });
  }

  get todayTasks(): Task[] {
    return this.homeService.getTodayTasks();
  }

  get profileSummaryName(): string {
    return this.profileSummary.fullName || this.patient.name;
  }

  get profileSummaryAge(): number | null {
    return this.profileSummary.age ?? (Number.isFinite(this.patient.age) && this.patient.age > 0 ? this.patient.age : null);
  }

  get profileSummaryCaregiver(): string {
    return this.profileSummary.mainCaregiver || this.patient.caregiver;
  }

  get profileSummaryInitials(): string {
    return this.initialsFromName(this.profileSummaryName);
  }

  get patientInitials(): string {
    return this.profileSummaryInitials || this.patient.initials;
  }

  get patientPhoto(): string {
    return this.profileSummary.photo;
  }

  get patientProfileSummary(): string {
    const details = [
      this.profileSummaryAge !== null ? `${this.profileSummaryAge} anos` : '',
      this.patient.condition
    ].filter(Boolean);

    return details.join(' · ');
  }

  get displayAge(): string {
    return this.profileSummaryAge === null ? 'Idade nao informada' : `${this.profileSummaryAge} anos`;
  }

  get displayCaregiver(): string {
    return this.profileSummaryCaregiver || 'Cuidador nao informado';
  }

  get attentionTasks(): Task[] {
    return this.homeService.getAttentionTasks();
  }

  get riskSummary() {
    return this.homeService.getRiskSummary();
  }

  get emergencyContacts() {
    return this.homeService.getEmergencyContacts();
  }

  get recentActivity(): ActivityLog[] {
    return this.homeService.getRecentActivity();
  }

  get todayCalendarReminders(): CalendarReminder[] {
    return this.homeService.getTodayCalendarReminders();
  }

  toggleReminder(event: Event, reminder: CalendarReminder): void {
    event.stopPropagation();
    event.preventDefault();
    this.homeService.toggleReminderStatus(reminder.id, reminder.status);
  }

  deleteReminder(event: Event, reminder: CalendarReminder): void {
    event.stopPropagation();
    event.preventDefault();
    const confirmed = window.confirm(`Remover o lembrete "${reminder.title}"?`);
    if (confirmed) {
      this.homeService.deleteReminder(reminder.id);
    }
  }

  getReminderCategoryLabel(category: string): string {
    switch (category) {
      case 'appointment': return 'Consulta';
      case 'shopping': return 'Compras';
      case 'outing': return 'Passeio';
      default: return 'Outros';
    }
  }

  getReminderDotClass(category: string): string {
    switch (category) {
      case 'appointment': return 'dot-orange';
      case 'shopping': return 'dot-blue';
      case 'outing': return 'dot-green';
      default: return 'dot-gray';
    }
  }

  get taskTemplates(): readonly TaskTemplate[] {
    return this.homeService.getTaskTemplates();
  }

  openEmergencyContacts(): void {
    this.emergencyOpen = true;
  }

  closeEmergencyContacts(): void {
    this.emergencyOpen = false;
  }

  statusLabel(status: TaskStatus): string {
    return this.homeService.getTaskStatusLabel(status);
  }

  priorityTone(index: number): 'neutral' | 'orange' | 'green' {
    return this.homeService.getPriorityTone(index);
  }

  taskIconLabel(icon: string): string {
    return this.homeService.getTaskIconLabel(icon);
  }

  hasPracticalGuide(task: Task): boolean {
    return this.homeService.hasPracticalGuide(task);
  }

  getGuideSlugByTask(task: Task): string | null {
    return this.homeService.getGuideSlugByTask(task);
  }

  getPracticalGuideRoute(task: Task): string | null {
    return this.homeService.getPracticalGuideRoute(task);
  }

  openTaskGuide(event: Event, task: Task): void {
    this.openGuide(event, this.getPracticalGuideRoute(task));
  }

  isTaskBusy(taskId: string): boolean {
    return this.pendingTaskIds.has(taskId);
  }

  toggleTask(event: Event, taskId: string): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.isTaskBusy(taskId)) {
      return;
    }

    this.taskActionError = '';
    this.pendingTaskIds.add(taskId);
    this.homeService.toggleTaskStatus(taskId).subscribe({
      next: () => {
        this.pendingTaskIds.delete(taskId);
        this.reloadActivity();
      },
      error: (err) => {
        this.pendingTaskIds.delete(taskId);
        this.taskActionError = err.error?.message || 'Nao foi possivel atualizar a tarefa. Tente novamente.';
      }
    });
  }

  deleteTask(event: Event, task: Task): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.isTaskBusy(task.id)) {
      return;
    }

    const confirmed = window.confirm(`Remover a tarefa "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    this.taskActionError = '';
    this.pendingTaskIds.add(task.id);
    this.homeService.deleteTask(task.id).subscribe({
      next: () => {
        this.pendingTaskIds.delete(task.id);
        this.reloadActivity();
      },
      error: (err) => {
        this.pendingTaskIds.delete(task.id);
        this.taskActionError = err.error?.message || 'Nao foi possivel remover a tarefa. Tente novamente.';
      }
    });
  }

  openGuide(event: Event, guideRoute: string | null): void {
    event.stopPropagation();
    event.preventDefault();
    if (guideRoute) {
      this.router.navigateByUrl(guideRoute);
      return;
    }

    this.taskActionError = 'Este lembrete nao possui guia pratico vinculado.';
  }

  openAddTask(): void {
    this.resetForm();
    this.addTaskOpen = true;
  }

  closeAddTask(): void {
    this.addTaskOpen = false;
  }

  selectTemplate(tpl: TaskTemplate): void {
    if (this.selectedTemplate?.id === tpl.id) {
      this.selectedTemplate = null;
      this.customTitle = '';
      return;
    }
    this.selectedTemplate = tpl;
    this.customTitle = tpl.title;
    this.taskCategory = tpl.category;
  }

  submitTask(): void {
    const title = sanitizeText(this.customTitle, 60);
    const detail = sanitizeText(this.taskDetail, 200);
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(this.taskTime);
    const validCategory = this.categories.some((category) => category.value === this.taskCategory);
    const validPriority = this.priorities.some((priority) => priority.value === this.taskPriority);

    this.customTitle = title;
    this.taskDetail = detail;

    if (title.length < 3) {
      this.addTaskError = 'Informe um titulo com pelo menos 3 caracteres.';
      return;
    }

    if (!validTime) {
      this.addTaskError = 'Informe um horario valido.';
      return;
    }

    if (!validCategory || !validPriority) {
      this.addTaskError = 'Revise categoria e prioridade antes de continuar.';
      return;
    }

    const draft: TaskDraft = {
      title,
      detail: detail || `Previsto para ${this.taskTime}`,
      time: this.taskTime,
      category: this.taskCategory,
      priority: this.taskPriority,
      guideRoute: this.selectedTemplate?.guideRoute
    };

    this.homeService.addTask(draft).subscribe({
      next: () => {
        this.addTaskOpen = false;
        this.addTaskError = '';
        this.reloadActivity();
      },
      error: (err) => {
        this.addTaskError = err.error?.message || 'Erro ao adicionar a tarefa.';
      }
    });
  }

  formatLogTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  activityLabel(log: ActivityLog): string {
    return this.homeService.getActivityLabel(log);
  }

  activitySummary(log: ActivityLog): string {
    return this.homeService.getActivitySummary(log);
  }

  activityIcon(log: ActivityLog): string {
    return this.homeService.getActivityIcon(log);
  }

  activityTone(log: ActivityLog): string {
    return this.homeService.getActivityTone(log);
  }

  private resetForm(): void {
    this.selectedTemplate = null;
    this.customTitle = '';
    this.taskTime = '';
    this.taskCategory = 'routine';
    this.taskPriority = 'normal';
    this.taskDetail = '';
    this.addTaskError = '';
  }

  private reloadActivity(): void {
    this.homeService.reloadActivity().subscribe({
      next: () => {
      },
      error: (err) => {
        console.error('Error loading activity logs:', err);
      }
    });
  }

  private initialsFromName(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CB';
  }
}
