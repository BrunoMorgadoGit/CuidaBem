import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PatientService } from '../../../core/services/patient.service';
import { CalendarReminder } from '../models/calendar.models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly patientService = inject(PatientService);

  private remindersSubject = new BehaviorSubject<CalendarReminder[]>([]);
  public reminders$ = this.remindersSubject.asObservable();

  constructor() {
    this.reloadRemindersFromStorage();
  }

  reloadRemindersFromStorage(): CalendarReminder[] {
    const patient = this.patientService.getCurrentPatient();
    if (patient && patient.id) {
      this.loadReminders(patient.id).subscribe();
    }
    return this.remindersSubject.value;
  }

  loadReminders(patientId: string): Observable<CalendarReminder[]> {
    return this.http.get<any>(`${environment.apiUrl}/calendar?patientId=${patientId}`).pipe(
      map((res) => {
        const reminders = res.data || [];
        this.remindersSubject.next(reminders);
        return reminders;
      })
    );
  }

  getRemindersByDate(date: string): Observable<CalendarReminder[]> {
    return this.reminders$.pipe(
      map(all => all.filter(r => r.date === date).sort((a, b) => a.time.localeCompare(b.time)))
    );
  }

  getAllReminders(): CalendarReminder[] {
    return this.remindersSubject.value;
  }

  addReminder(reminderData: Omit<CalendarReminder, 'id' | 'createdAt' | 'status'>): void {
    const patient = this.patientService.getCurrentPatient();
    const payload = {
      patientId: patient?.id,
      ...reminderData
    };

    this.http.post<any>(`${environment.apiUrl}/calendar`, payload).subscribe({
      next: () => {
        this.reloadRemindersFromStorage();
      }
    });
  }

  updateReminder(id: string, updates: Partial<CalendarReminder>): void {
    this.http.put<any>(`${environment.apiUrl}/calendar/${id}`, updates).subscribe({
      next: () => {
        this.reloadRemindersFromStorage();
      }
    });
  }

  completeReminder(id: string): void {
    this.updateReminder(id, {
      status: 'completed',
      completedBy: 'Cuidador'
    });
  }

  deleteReminder(id: string): void {
    this.http.delete<any>(`${environment.apiUrl}/calendar/${id}`).subscribe({
      next: () => {
        this.reloadRemindersFromStorage();
      }
    });
  }
}
