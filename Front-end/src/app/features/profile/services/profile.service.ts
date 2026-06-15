import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { BrowserStorageService } from '../../../core/services/browser-storage.service';
import { UserService } from '../../../core/services/user.service';
import { EMPTY_USER_PROFILE, USER_PROFILE_STORAGE_KEY_PREFIX, type UserProfile } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly storage = inject(BrowserStorageService);
  private readonly userService = inject(UserService);
  private readonly profileSubject = new BehaviorSubject<UserProfile>(this.loadProfile());

  readonly profile$: Observable<UserProfile> = this.profileSubject.asObservable();

  getProfile(): UserProfile {
    const profile = this.loadProfile();
    this.profileSubject.next(this.cloneProfile(profile));
    return profile;
  }

  saveProfile(profile: UserProfile): UserProfile {
    const sanitizedProfile = this.normalizeProfile(profile);
    this.persistProfile(sanitizedProfile);
    this.profileSubject.next(this.cloneProfile(sanitizedProfile));
    return sanitizedProfile;
  }

  updateProfile(profile: UserProfile): UserProfile {
    return this.saveProfile(profile);
  }

  removePhoto(): UserProfile {
    const profile = this.getProfile();
    const updatedProfile: UserProfile = {
      ...profile,
      photo: ''
    };

    this.persistProfile(updatedProfile);
    this.profileSubject.next(this.cloneProfile(updatedProfile));
    return updatedProfile;
  }

  refreshCurrentProfile(): UserProfile {
    const profile = this.loadProfile();
    this.profileSubject.next(this.cloneProfile(profile));
    return profile;
  }

  uploadOrStorePhoto(file: File): Promise<string> {
    // TODO: trocar por POST /api/profile/photo quando o backend de perfil estiver disponivel.
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('invalid-file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('read-failed'));
      reader.readAsDataURL(file);
    });
  }

  private loadProfile(): UserProfile {
    const rawProfile = this.storage.getItem(this.profileStorageKey());

    if (!rawProfile) {
      return this.cloneProfile(EMPTY_USER_PROFILE);
    }

    try {
      return this.normalizeProfile(JSON.parse(rawProfile));
    } catch {
      return this.cloneProfile(EMPTY_USER_PROFILE);
    }
  }

  private persistProfile(profile: UserProfile): void {
    this.storage.setItem(this.profileStorageKey(), JSON.stringify(profile));
  }

  private profileStorageKey(): string {
    const userId = this.userService.getCurrentUser().id;
    return `${USER_PROFILE_STORAGE_KEY_PREFIX}_${userId}`;
  }

  private normalizeProfile(value: Partial<UserProfile>): UserProfile {
    return {
      ...EMPTY_USER_PROFILE,
      ...value,
      id: value.id || EMPTY_USER_PROFILE.id,
      photo: this.safeString(value.photo),
      fullName: this.safeString(value.fullName),
      age: this.safeAge(value.age),
      birthDate: this.safeString(value.birthDate),
      phone: this.safeString(value.phone),
      emergencyPhone: this.safeString(value.emergencyPhone),
      mainCaregiver: this.safeString(value.mainCaregiver),
      responsibleFamilyMember: this.safeString(value.responsibleFamilyMember),
      healthConditions: this.safeList(value.healthConditions),
      medications: this.safeList(value.medications),
      allergies: this.safeList(value.allergies),
      notes: this.safeString(value.notes).slice(0, 500)
    };
  }

  private cloneProfile(profile: UserProfile): UserProfile {
    return {
      ...profile,
      healthConditions: [...profile.healthConditions],
      medications: [...profile.medications],
      allergies: [...profile.allergies]
    };
  }

  private safeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private safeAge(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const age = Number(value);
    return Number.isInteger(age) && age >= 0 && age <= 130 ? age : null;
  }

  private safeList(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => this.safeString(item))
      .filter(Boolean)
      .slice(0, 20);
  }
}
