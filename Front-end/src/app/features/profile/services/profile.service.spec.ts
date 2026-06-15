import { Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it } from 'vitest';

import { BrowserStorageService } from '../../../core/services/browser-storage.service';
import { UserService } from '../../../core/services/user.service';
import type { AppUser } from '../../../core/models';
import { EMPTY_USER_PROFILE, USER_PROFILE_STORAGE_KEY_PREFIX } from '../models';
import { ProfileService } from './profile.service';

class MemoryStorageService {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('ProfileService', () => {
  it('keeps patient profiles separated by the current user id', () => {
    let currentUser: AppUser = {
      id: 'user-a',
      name: 'Conta A',
      role: 'family',
      relatedElderlyIds: ['patient-a']
    };
    const storage = new MemoryStorageService();
    storage.setItem(USER_PROFILE_STORAGE_KEY_PREFIX, JSON.stringify({
      ...EMPTY_USER_PROFILE,
      fullName: 'Perfil legado global'
    }));

    const injector = Injector.create({
      providers: [
        { provide: BrowserStorageService, useValue: storage },
        {
          provide: UserService,
          useValue: {
            getCurrentUser: () => currentUser
          }
        },
        ProfileService
      ]
    });

    const service = runInInjectionContext(injector, () => injector.get(ProfileService));

    service.saveProfile({
      ...EMPTY_USER_PROFILE,
      fullName: 'Kleiton'
    });

    currentUser = {
      id: 'user-b',
      name: 'Conta B',
      role: 'family',
      relatedElderlyIds: ['patient-b']
    };

    expect(service.getProfile().fullName).toBe('');

    service.saveProfile({
      ...EMPTY_USER_PROFILE,
      fullName: 'Maria'
    });

    currentUser = {
      id: 'user-a',
      name: 'Conta A',
      role: 'family',
      relatedElderlyIds: ['patient-a']
    };

    expect(service.getProfile().fullName).toBe('Kleiton');
    expect(storage.getItem(`${USER_PROFILE_STORAGE_KEY_PREFIX}_user-b`)).toContain('Maria');
  });
});
