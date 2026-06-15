import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, Subscription, filter, map } from 'rxjs';
import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { CalendarService } from '../services/calendar.service';
import { CalendarReminder, CalendarReminderCategory } from '../models/calendar.models';

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  reminders: CalendarReminder[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PageShellComponent],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.css']
})
export class CalendarPage implements OnInit, OnDestroy {
  private readonly calendarService = inject(CalendarService);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();

  currentMonth = new Date();
  selectedDate = new Date();
  
  days: CalendarDay[] = [];
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  selectedDateReminders$: Observable<CalendarReminder[]>;
  pendingRemindersCount$!: Observable<number>;

  isModalOpen = false;
  editingReminderId: string | null = null;
  
  modalTitle = '';
  modalCategory: CalendarReminderCategory = 'appointment';
  modalDate = '';
  modalTime = '';
  modalRepeat = 'none';
  modalPriority = 'normal';
  modalNotes = '';

  constructor() {
    this.selectedDateReminders$ = this.calendarService.getRemindersByDate(this.formatDate(this.selectedDate));
  }

  ngOnInit() {
    this.calendarService.reloadRemindersFromStorage();
    this.generateCalendar();
    
    this.pendingRemindersCount$ = this.calendarService.reminders$.pipe(
      map(all => {
        const todayStr = this.formatDate(new Date());
        return all.filter(r => r.date === todayStr && r.status === 'pending').length;
      })
    );
    
    this.subscriptions.add(
      this.calendarService.reminders$.subscribe(() => {
        this.generateCalendar();
      })
    );

    this.subscriptions.add(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter((event) => event.urlAfterRedirects.includes('/calendario'))
      ).subscribe(() => {
        this.calendarService.reloadRemindersFromStorage();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  get currentMonthLabel(): string {
    const month = this.currentMonth.toLocaleDateString('pt-BR', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1) + ' de ' + this.currentMonth.getFullYear();
  }

  get selectedDateLabel(): string {
    const dateStr = this.selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  get todayLabel(): string {
    return new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: CalendarDay) {
    this.selectedDate = new Date(day.date + 'T12:00:00');
    this.selectedDateReminders$ = this.calendarService.getRemindersByDate(day.date);
    this.generateCalendar();
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const todayStr = this.formatDate(new Date());
    const selectedStr = this.formatDate(this.selectedDate);
    
    let startingDay = firstDayOfMonth.getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    this.days = [];
    const allReminders = this.calendarService.getAllReminders();

    for (let i = startingDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      const dateStr = this.formatDate(date);
      this.days.push({
        date: dateStr,
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedStr,
        reminders: allReminders.filter(r => r.date === dateStr)
      });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = this.formatDate(date);
      this.days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedStr,
        reminders: allReminders.filter(r => r.date === dateStr)
      });
    }

    const remainingDays = 42 - this.days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = this.formatDate(date);
      this.days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedStr,
        reminders: allReminders.filter(r => r.date === dateStr)
      });
    }
  }

  getDotClass(category: CalendarReminderCategory): string {
    switch (category) {
      case 'appointment': return 'dot-orange';
      case 'shopping': return 'dot-blue';
      case 'outing': return 'dot-green';
      default: return 'dot-gray';
    }
  }

  getCategoryLabel(category: CalendarReminderCategory): string {
    switch (category) {
      case 'appointment': return 'Consulta';
      case 'shopping': return 'Compras do dia';
      case 'outing': return 'Passeio';
      default: return 'Outros';
    }
  }

  openModal(reminder?: CalendarReminder) {
    if (reminder) {
      this.editingReminderId = reminder.id;
      this.modalTitle = reminder.title;
      this.modalCategory = reminder.category;
      this.modalDate = reminder.date;
      this.modalTime = reminder.time;
      this.modalRepeat = reminder.repeat;
      this.modalPriority = reminder.priority;
      this.modalNotes = reminder.notes || '';
    } else {
      this.editingReminderId = null;
      this.modalTitle = '';
      this.modalCategory = 'appointment';
      this.modalDate = this.formatDate(this.selectedDate);
      this.modalTime = '12:00';
      this.modalRepeat = 'none';
      this.modalPriority = 'normal';
      this.modalNotes = '';
    }
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveReminder() {
    if (!this.modalTitle || !this.modalDate || !this.modalTime) return;

    const data: any = {
      title: this.modalTitle,
      category: this.modalCategory,
      date: this.modalDate,
      time: this.modalTime,
      repeat: this.modalRepeat,
      priority: this.modalPriority,
      notes: this.modalNotes
    };

    if (this.editingReminderId) {
      this.calendarService.updateReminder(this.editingReminderId, data);
    } else {
      this.calendarService.addReminder(data);
    }
    this.closeModal();
  }

  completeReminder(id: string) {
    this.calendarService.completeReminder(id);
  }

  deleteReminder(id: string) {
    if (confirm('Tem certeza que deseja excluir este lembrete?')) {
      this.calendarService.deleteReminder(id);
    }
  }
}
