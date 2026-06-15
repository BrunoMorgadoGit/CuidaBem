import { Injectable } from '@angular/core';

import type { AppUser } from '../models';

const DEFAULT_USER: AppUser = {
  id: 'user-demo',
  name: 'Cuidador Exemplo',
  role: 'family',
  relatedElderlyIds: ['patient-demo']
};

const CURRENT_USER_STORAGE_KEY = 'cuida_bem_user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUser: AppUser;

  constructor() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      this.currentUser = stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      this.currentUser = DEFAULT_USER;
    }
  }

  getCurrentUser(): AppUser {
    return this.currentUser;
  }

  setCurrentUser(user: AppUser): void {
    this.currentUser = user;
    try {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }

  clearCurrentUser(): void {
    this.currentUser = DEFAULT_USER;
    try {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    } catch {}
  }
}
