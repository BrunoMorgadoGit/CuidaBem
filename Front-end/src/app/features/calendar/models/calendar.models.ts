export type CalendarReminderCategory = 'appointment' | 'shopping' | 'outing' | 'other';
export type CalendarReminderPriority = 'normal' | 'important' | 'urgent';
export type CalendarReminderStatus = 'pending' | 'completed' | 'cancelled' | 'late';
export type CalendarReminderRepeat = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarReminder {
  id: string;
  title: string;
  category: CalendarReminderCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  repeat: CalendarReminderRepeat;
  priority: CalendarReminderPriority;
  notes?: string;
  status: CalendarReminderStatus;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
}
