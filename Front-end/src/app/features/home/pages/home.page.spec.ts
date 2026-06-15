import { describe, expect, it, vi } from 'vitest';
import { ChangeDetectorRef, Injector, runInInjectionContext } from '@angular/core';
import { Router } from '@angular/router';

import { of } from 'rxjs';

import type { Patient, Task } from '../../../core/models';
import { ActivityLogService, EmergencyService, PatientService, TaskService } from '../../../core/services';
import { CalendarService } from '../../calendar/services/calendar.service';
import { GuideService } from '../../guide/services/guide.service';
import type { UserProfile } from '../../profile/models';
import { ProfileService } from '../../profile/services';
import { HomeService } from '../services/home.service';
import { HomePage } from './home.page';

const TEST_PATIENT: Patient = {
  id: 'patient-1',
  name: 'Maria Aparecida Santos',
  initials: 'MA',
  age: 78,
  condition: 'Diabetes · Hipertensao',
  plan: 'Estavel',
  address: 'Rua Exemplo',
  caregiver: 'Lucas'
};

const TEST_PROFILE: UserProfile = {
  id: 'local-profile',
  photo: '',
  fullName: '',
  age: null,
  birthDate: '',
  phone: '',
  emergencyPhone: '',
  mainCaregiver: '',
  responsibleFamilyMember: '',
  healthConditions: [],
  medications: [],
  allergies: [],
  notes: ''
};

function createPage(profile: UserProfile = TEST_PROFILE, patient: Patient = TEST_PATIENT): HomePage {
  const injector = Injector.create({
    providers: [
      EmergencyService,
      HomeService,
      {
        provide: PatientService,
        useValue: {
          getCurrentPatient: vi.fn(() => patient),
          loadCurrentPatient: vi.fn(() => of({ success: true, data: patient }))
        }
      },
      {
        provide: TaskService,
        useValue: {
          getTodayTasks: vi.fn(() => []),
          getTaskTemplates: vi.fn(() => []),
          addTask: vi.fn(),
          toggleTaskStatus: vi.fn(),
          deleteTask: vi.fn()
        }
      },
      {
        provide: GuideService,
        useValue: {
          hasPracticalGuideRoute: vi.fn(() => false),
          getPracticalGuideRoute: vi.fn(() => null)
        }
      },
      {
        provide: CalendarService,
        useValue: {
          loadReminders: vi.fn(),
          getAllReminders: vi.fn(() => []),
          updateReminder: vi.fn(),
          deleteReminder: vi.fn()
        }
      },
      {
        provide: ProfileService,
        useValue: {
          getProfile: vi.fn(() => profile),
          refreshCurrentProfile: vi.fn(() => profile),
          profile$: of(profile)
        }
      },
      {
        provide: ActivityLogService,
        useValue: {
          getRecentLogs: vi.fn(() => []),
          log: vi.fn()
        }
      },
      {
        provide: Router,
        useValue: {
          navigateByUrl: vi.fn()
        }
      },
      {
        provide: ChangeDetectorRef,
        useValue: {
          markForCheck: vi.fn()
        }
      }
    ]
  });

  return runInInjectionContext(injector, () => new HomePage());
}

function task(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    elderlyId: 'patient-1',
    title: 'Tarefa',
    detail: '',
    time: '08:00',
    category: 'routine',
    priority: 'normal',
    status: 'next',
    icon: 'checkmark-circle-outline',
    ...overrides
  };
}

describe('HomePage', () => {
  it('maps task statuses to user-facing labels', () => {
    const page = createPage();

    expect(page.statusLabel('done')).toBe('Concluida');
    expect(page.statusLabel('next')).toBe('Pendente');
    expect(page.statusLabel('late')).toBe('Atencao');
  });

  it('maps task position to priority tone', () => {
    const page = createPage();

    expect(page.priorityTone(0)).toBe('neutral');
    expect(page.priorityTone(1)).toBe('orange');
    expect(page.priorityTone(2)).toBe('orange');
    expect(page.priorityTone(3)).toBe('green');
  });

  it('maps known task icons and falls back for unknown icons', () => {
    const page = createPage();

    expect(page.taskIconLabel('medical-outline')).toBe('RX');
    expect(page.taskIconLabel('water-outline')).toBe('H2O');
    expect(page.taskIconLabel('missing-icon')).toBe('OK');
  });

  it('opens and closes emergency contacts', () => {
    const page = createPage();

    expect(page.emergencyOpen).toBe(false);

    page.openEmergencyContacts();
    expect(page.emergencyOpen).toBe(true);

    page.closeEmergencyContacts();
    expect(page.emergencyOpen).toBe(false);
  });

  it('uses the edited profile as the home patient summary source', () => {
    const page = createPage({
      ...TEST_PROFILE,
      fullName: 'Kleiton',
      age: 35,
      mainCaregiver: 'Lucas'
    });

    expect(page.profileSummaryName).toBe('Kleiton');
    expect(page.profileSummaryAge).toBe(35);
    expect(page.patientInitials).toBe('K');
    expect(page.patientPhoto).toBe('');
    expect(page.patientProfileSummary).toBe('35 anos · Diabetes · Hipertensao');
    expect(page.profileSummaryCaregiver).toBe('Lucas');
  });

  it('uses the stored profile photo on the home summary', () => {
    const page = createPage({
      ...TEST_PROFILE,
      fullName: 'Lucas Brasil',
      photo: 'data:image/png;base64,patient-photo'
    });

    expect(page.patientPhoto).toBe('data:image/png;base64,patient-photo');
    expect(page.patientInitials).toBe('LB');
  });

  it('keeps guide navigation only for tasks with an existing practical guide', () => {
    const page = createPage();

    expect(page.getGuideSlugByTask(task({ title: 'Banho no leito', guideRoute: '/guia/banho-de-leito' }))).toBe('banho-de-leito');
    expect(page.getPracticalGuideRoute(task({ title: 'Troca de fralda', guideRoute: '/guia/troca-de-fralda' }))).toBe('/guia-pratico/troca-de-fralda');
    expect(page.getGuideSlugByTask(task({ title: 'Exercicios leves', guideRoute: '/tabs/health' }))).toBe('mobilidade');
    expect(page.getGuideSlugByTask(task({ title: 'Observacao' }))).toBe('registro-do-cuidado');
  });

  it('does not expose guide navigation for tasks without a practical guide', () => {
    const page = createPage();

    expect(page.hasPracticalGuide(task({ title: 'Hidratacao', guideRoute: '/guia/controle-de-hidratacao' }))).toBe(false);
    expect(page.getPracticalGuideRoute(task({ title: 'Medicacao', guideRoute: '/guia/administracao-de-medicacao' }))).toBeNull();
    expect(page.getGuideSlugByTask(task({ title: 'Check-in', guideRoute: '/tabs/profile' }))).toBeNull();
    expect(page.getGuideSlugByTask(task({ title: 'Bem-estar', guideRoute: '/tabs/profile' }))).toBeNull();
    expect(page.getGuideSlugByTask(task({ title: 'Alimentacao assistida', guideRoute: '/guia/alimentacao-assistida' }))).toBeNull();
  });
});
