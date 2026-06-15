import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MOCK_PATIENT } from '../data/care.mock';
import type { Patient } from '../models';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';
import { UserService } from './user.service';

export interface PaginatedPatients {
  data: Patient[];
  total: number;
  pagina: number;
  limite: number;
  paginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private currentPatient: Patient;
  private userService: UserService | null = null;
  private http: HttpClient | null = null;
  private cacheService: CacheService | null = null;

  constructor() {
    try {
      this.userService = inject(UserService);
    } catch {
      this.userService = null;
    }

    try {
      this.http = inject(HttpClient);
    } catch {
      this.http = null;
    }

    try {
      this.cacheService = inject(CacheService);
    } catch {
      this.cacheService = null;
    }

    try {
      const stored = localStorage.getItem(this.currentPatientStorageKey());
      this.currentPatient = stored ? JSON.parse(stored) : MOCK_PATIENT;
    } catch {
      this.currentPatient = MOCK_PATIENT;
    }
  }

  getCurrentPatient(): Patient {
    return this.currentPatient;
  }

  setCurrentPatient(patient: Patient): void {
    this.currentPatient = patient;
    try {
      localStorage.setItem(this.currentPatientStorageKey(), JSON.stringify(patient));
    } catch {}
  }

  clearCurrentPatient(): void {
    this.currentPatient = MOCK_PATIENT;
    try {
      localStorage.removeItem('cuida_bem_patient');
    } catch {}
  }

  loadCurrentPatient(): Observable<any> {
    if (!this.http) {
      return of({ success: true, data: this.currentPatient });
    }
    return this.http.get<any>(`${environment.apiUrl}/patients/current`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setCurrentPatient(res.data);
        }
      })
    );
  }

  getPatientsList(pagina = 1, limite = 10): Observable<PaginatedPatients> {
    const chave = `pacientes-${pagina}-${limite}`;
    
    if (!this.http) {
      return of({
        data: [this.currentPatient],
        total: 1,
        pagina,
        limite,
        paginas: 1
      });
    }

    const request$ = this.http.get<any>(`${environment.apiUrl}/patients`).pipe(
      map((res) => ({
        data: res.data || [],
        total: (res.data || []).length,
        pagina,
        limite,
        paginas: 1
      }))
    );

    if (this.cacheService) {
      return this.cacheService.obterOuGravar(chave, request$, 5);
    }
    return request$;
  }

  limparCache(): void {
    if (this.cacheService) {
      this.cacheService.limpar();
    }
  }

  private currentPatientStorageKey(): string {
    const userId = this.userService?.getCurrentUser().id ?? 'user-demo';
    return `cuida_bem_patient_${userId}`;
  }
}
