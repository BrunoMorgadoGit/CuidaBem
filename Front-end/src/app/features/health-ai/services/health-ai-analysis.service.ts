import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AnalysisRequest {
  imageUrl: string;
  category: 'pele' | 'excreção' | 'comportamento' | 'vital';
  notes?: string;
  idosoId?: number;
}

export interface AnalysisResponse {
  success: boolean;
  category: string;
  riskLevel: 'baixo' | 'moderado' | 'alto';
  title: string;
  summary: string;
  observations: string[];
  recommendations: string[];
  warning: string;
}

@Injectable({ providedIn: 'root' })
export class HealthAiAnalysisService {
  private readonly http = inject(HttpClient);
  private readonly TIMEOUT_MS = 60000; // 60 segundos

  
  async analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<AnalysisResponse>(
          `${environment.apiUrl}/health-ai/analyze`,
          {
            category: request.category,
            imageUrl: request.imageUrl,
            notes: request.notes
          }
        ).pipe(
          timeout(this.TIMEOUT_MS)
        )
      );

      if (!response.success) {
        throw new Error('Análise falhou no servidor');
      }

      return response;
    } catch (error: any) {
      if (error.name === 'TimeoutError') {
        throw new Error('Análise excedeu o tempo limite (60s). Tente novamente.');
      }
      throw error;
    }
  }

  
  getCategories(): Array<{ value: string; label: string }> {
    return [
      { value: 'pele', label: 'Pele / Lesões' },
      { value: 'excreção', label: 'Excreção' },
      { value: 'comportamento', label: 'Comportamento' },
      { value: 'vital', label: 'Sinais Vitais' }
    ];
  }
}
