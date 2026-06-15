import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { CareTeamMember, CaregiverRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CareTeamService {
  private readonly http = inject(HttpClient);

  listMembers(patientId: string): Observable<CareTeamMember[]> {
    return this.http
      .get<any>(`${environment.apiUrl}/patients/${patientId}/members`)
      .pipe(map((res) => res.data || []));
  }

  addMember(
    patientId: string,
    email: string,
    role: CaregiverRole
  ): Observable<CareTeamMember> {
    return this.http
      .post<any>(`${environment.apiUrl}/patients/${patientId}/members`, { email, role })
      .pipe(map((res) => res.data));
  }

  updateMember(memberId: string, role: CaregiverRole): Observable<CareTeamMember> {
    return this.http
      .patch<any>(`${environment.apiUrl}/members/${memberId}`, { role })
      .pipe(map((res) => res.data));
  }

  removeMember(memberId: string): Observable<any> {
    return this.http
      .delete<any>(`${environment.apiUrl}/members/${memberId}`)
      .pipe(map((res) => res.data));
  }
}
