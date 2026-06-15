import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MOCK_EMERGENCY_CONTACTS, MOCK_SUPPORT_CONTACTS } from '../data/care.mock';
import type { EmergencyContact, EmergencyContactTone, SupportContact } from '../models';

function emergencyTone(name: string, phone: string): EmergencyContactTone {
  const normalizedName = name.toLowerCase();
  if (phone === '192' || normalizedName.includes('samu')) {
    return 'samu';
  }
  if (phone === '193' || normalizedName.includes('bombeiro')) {
    return 'fire';
  }
  if (phone === '190' || normalizedName.includes('polícia') || normalizedName.includes('policia')) {
    return 'police';
  }
  if (phone === '136' || normalizedName.includes('saúde') || normalizedName.includes('saude')) {
    return 'health';
  }
  return 'samu';
}

function normalizeEmergencyContact(item: any, index: number): EmergencyContact {
  const phone = String(item.phone ?? item.number ?? '').trim();
  const name = String(item.name ?? '').trim();
  const detail = String(item.description ?? item.detail ?? '').trim();

  return {
    id: String(item.id ?? `emergency-${phone || index}`),
    number: phone,
    name,
    detail,
    tone: item.tone ?? emergencyTone(name, phone),
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {
  private http: HttpClient | null = null;
  private emergencyContacts: EmergencyContact[] = [];
  private supportContacts: SupportContact[] = [];

  constructor() {
    try {
      this.http = inject(HttpClient);
    } catch {
      this.http = null;
    }
  }

  // Original synchronous methods for unit tests
  getEmergencyContacts(): readonly EmergencyContact[] {
    if (this.emergencyContacts.length > 0) {
      return this.emergencyContacts;
    }
    return MOCK_EMERGENCY_CONTACTS;
  }

  getSupportContacts(): readonly SupportContact[] {
    if (this.supportContacts.length > 0) {
      return this.supportContacts;
    }
    return MOCK_SUPPORT_CONTACTS;
  }

  // Real backend API methods
  loadEmergencyContacts(): Observable<EmergencyContact[]> {
    if (!this.http) {
      this.emergencyContacts = MOCK_EMERGENCY_CONTACTS as EmergencyContact[];
      return of(this.emergencyContacts);
    }
    return this.http.get<any>(`${environment.apiUrl}/emergency-contacts`).pipe(
      map((res) => {
        const items = Array.isArray(res) ? res : res.data || [];
        return items.map(normalizeEmergencyContact);
      }),
      tap((mapped) => {
        this.emergencyContacts = mapped;
      }),
      catchError((err) => {
        console.error('Error loading emergency contacts:', err);
        this.emergencyContacts = MOCK_EMERGENCY_CONTACTS as EmergencyContact[];
        return of(this.emergencyContacts);
      })
    );
  }

  loadSupportContacts(patientId: string): Observable<SupportContact[]> {
    if (!this.http) {
      this.supportContacts = MOCK_SUPPORT_CONTACTS as SupportContact[];
      return of(this.supportContacts);
    }
    return this.http.get<any>(`${environment.apiUrl}/support-contacts?patientId=${patientId}`).pipe(
      map((res) => {
        const items = res.data || [];
        return items.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          phone: item.phone
        }));
      }),
      tap((mapped) => {
        this.supportContacts = mapped;
      })
    );
  }
}
