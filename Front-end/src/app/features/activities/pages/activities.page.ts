import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ActivityItem, ActivityLog } from '../../../core/models';
import { BottomNavigationComponent } from '../../../shared/components';
import { ActivityGroupFilter, ActivityLogService, ActivityPeriodFilter, PatientService } from '../../../core/services';
import { trackById } from '../../../shared/utils';
import { ActivityService } from '../services/activity.service';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [BottomNavigationComponent, CommonModule, RouterLink],
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.css'],
})
export class ActivitiesPage implements OnInit {
  private readonly activityService = inject(ActivityService);
  private readonly activityLogService = inject(ActivityLogService);
  private readonly patientService = inject(PatientService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly activities = this.activityService.getActivities();
  readonly trackByActivityId = trackById<ActivityItem>;
  readonly trackByLogId = trackById<ActivityLog>;
  readonly periodFilters: { value: ActivityPeriodFilter; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
    { value: 'all', label: 'Todos' }
  ];
  readonly groupFilters: { value: ActivityGroupFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'added', label: 'Adicionados' },
    { value: 'edited', label: 'Editados' },
    { value: 'removed', label: 'Removidos' },
    { value: 'observations', label: 'Observações' }
  ];

  logs: ActivityLog[] = [];
  selectedPeriod: ActivityPeriodFilter = 'all';
  selectedGroup: ActivityGroupFilter = 'all';

  ngOnInit(): void {
    const patient = this.patientService.getCurrentPatient();
    this.activityLogService.loadLogs(patient.id).subscribe({
      next: (res) => {
        this.logs = res;
      },
      error: (err) => {
        console.error('Error loading activity logs:', err);
      }
    });
  }

  get filteredLogs(): ActivityLog[] {
    return this.activityLogService.getFullHistoryLogs(this.logs, this.selectedPeriod, this.selectedGroup);
  }

  activityIconLabel(icon: string): string {
    return this.activityService.getActivityIconLabel(icon);
  }

  activityLabel(log: ActivityLog): string {
    return this.activityLogService.getActivityLabel(log);
  }

  activitySummary(log: ActivityLog): string {
    return this.activityLogService.formatActivitySummary(log);
  }

  activityTone(log: ActivityLog): string {
    return this.activityLogService.getActivityTone(log);
  }

  activityIcon(log: ActivityLog): string {
    return this.activityLogService.getActivityIcon(log);
  }

  activityCardTone(icon: string): string {
    const tones: Record<string, string> = {
      'chatbubble-ellipses-outline': 'purple',
      'fitness-outline': 'green',
      'water-outline': 'blue'
    };
    return tones[icon] ?? 'neutral';
  }

  setPeriodFilter(filter: ActivityPeriodFilter): void {
    this.selectedPeriod = filter;
  }

  setGroupFilter(filter: ActivityGroupFilter): void {
    this.selectedGroup = filter;
  }

  formatLogTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
