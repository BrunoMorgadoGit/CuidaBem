import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calendarService } from './calendar.service';
import { prisma } from '../../config/database';
import { patientService } from '../patients/patient.service';

vi.mock('../../config/database', () => ({
  prisma: {
    calendarReminder: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('../patients/patient.service', () => ({
  patientService: {
    ensureAccess: vi.fn(),
  },
}));

describe('CalendarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReminders', () => {
    it('should query reminders and ensure access', async () => {
      const mockReminders = [
        { id: '1', title: 'Medicação', category: 'medication', date: '2026-06-12', time: '10:00' }
      ];
      vi.mocked(prisma.calendarReminder.findMany).mockResolvedValue(mockReminders as any);
      vi.mocked(patientService.ensureAccess).mockResolvedValue(undefined as any);

      const result = await calendarService.getReminders('user-1', 'patient-1');
      expect(result).toEqual(mockReminders);
      expect(patientService.ensureAccess).toHaveBeenCalledWith('user-1', 'patient-1');
      expect(prisma.calendarReminder.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-1' },
        orderBy: [
          { date: 'asc' },
          { time: 'asc' }
        ]
      });
    });
  });

  describe('createReminder', () => {
    it('should create new reminder', async () => {
      const input = {
        title: 'Consulta',
        category: 'appointment',
        date: '2026-06-12',
        time: '14:30',
        notes: 'Cardiologista'
      };
      const mockCreated = { id: 'reminder-1', ...input, status: 'pending' };
      vi.mocked(prisma.calendarReminder.create).mockResolvedValue(mockCreated as any);
      vi.mocked(patientService.ensureAccess).mockResolvedValue(undefined as any);

      const result = await calendarService.createReminder('user-1', 'patient-1', input);
      expect(result).toEqual(mockCreated);
      expect(prisma.calendarReminder.create).toHaveBeenCalledWith({
        data: {
          patientId: 'patient-1',
          title: 'Consulta',
          category: 'appointment',
          date: '2026-06-12',
          time: '14:30',
          repeat: 'none',
          priority: 'normal',
          notes: 'Cardiologista',
          status: 'pending'
        }
      });
    });
  });

  describe('updateReminder', () => {
    it('should update reminder if exists and user has access', async () => {
      const existing = { id: 'reminder-1', patientId: 'patient-1', title: 'Antigo' };
      const updates = { title: 'Novo', status: 'completed', completedBy: 'Familiar' };
      
      vi.mocked(prisma.calendarReminder.findUnique).mockResolvedValue(existing as any);
      vi.mocked(prisma.calendarReminder.update).mockResolvedValue({ ...existing, ...updates } as any);
      vi.mocked(patientService.ensureAccess).mockResolvedValue(undefined as any);

      const result = await calendarService.updateReminder('user-1', 'reminder-1', updates);
      expect(result.title).toBe('Novo');
      expect(prisma.calendarReminder.update).toHaveBeenCalled();
    });

    it('should throw error if reminder not found', async () => {
      vi.mocked(prisma.calendarReminder.findUnique).mockResolvedValue(null);
      await expect(calendarService.updateReminder('user-1', 'reminder-2', { title: 'Novo' })).rejects.toThrow('REMINDER_NOT_FOUND');
    });
  });

  describe('deleteReminder', () => {
    it('should delete reminder', async () => {
      const existing = { id: 'reminder-1', patientId: 'patient-1' };
      vi.mocked(prisma.calendarReminder.findUnique).mockResolvedValue(existing as any);
      vi.mocked(prisma.calendarReminder.delete).mockResolvedValue(existing as any);

      const result = await calendarService.deleteReminder('user-1', 'reminder-1');
      expect(result.deleted).toBe(true);
      expect(prisma.calendarReminder.delete).toHaveBeenCalledWith({ where: { id: 'reminder-1' } });
    });
  });
});
