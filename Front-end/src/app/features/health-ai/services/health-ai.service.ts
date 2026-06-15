import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { MOCK_HEALTH_OBSERVATIONS } from '../data/health-ai.mock';
import type { HealthObservation, HealthObservationDraft } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HealthAiService {
  private http: HttpClient | null = null;
  private readonly apiUrl = `${environment.apiUrl}/health/observations`;

  constructor() {
    try {
      this.http = inject(HttpClient);
    } catch {
      this.http = null;
    }
  }

  getObservationOptions(): readonly HealthObservation[] {
    return MOCK_HEALTH_OBSERVATIONS;
  }

  saveObservationDraft(_draft: HealthObservationDraft): void {}

  async analyzeObservation(category: string, inputData: any): Promise<any> {
    const payload = {
      patientId: 'patient-123',
      category,
      inputData
    };
    if (!this.http) {
      return { success: true, data: { analysis: 'Análise simulada sem backend.' } };
    }
    return firstValueFrom(this.http.post(`${this.apiUrl}/analyze`, payload));
  }
}
