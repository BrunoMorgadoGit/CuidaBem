import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MOCK_EXERCISES } from '../data/exercises.mock';
import type { ExerciseItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ExercisesService {
  private http: HttpClient | null = null;

  constructor() {
    try {
      this.http = inject(HttpClient);
    } catch {
      this.http = null;
    }
  }

  // Original synchronous methods for unit tests
  getExercises(): readonly ExerciseItem[] {
    return MOCK_EXERCISES;
  }

  getExerciseById(id: string): ExerciseItem | undefined {
    return MOCK_EXERCISES.find((exercise) => exercise.id === id);
  }

  // Real backend API methods
  getExercisesApi(): Observable<ExerciseItem[]> {
    if (!this.http) {
      return new Observable<ExerciseItem[]>((subscriber) => {
        subscriber.next(this.getExercises() as ExerciseItem[]);
        subscriber.complete();
      });
    }
    return this.http.get<any>(`${environment.apiUrl}/exercises`).pipe(
      map((res) => {
        const items = res.data || [];
        return MOCK_EXERCISES.map((localExercise) => {
          const apiExercise = items.find((item: any) => this.matchesExercise(item, localExercise));
          return this.mapExerciseItem(apiExercise, localExercise);
        });
      })
    );
  }

  getExerciseByIdApi(id: string): Observable<ExerciseItem> {
    if (!this.http) {
      return new Observable<ExerciseItem>((subscriber) => {
        const item = this.getExerciseById(id);
        if (item) {
          subscriber.next(item as ExerciseItem);
        }
        subscriber.complete();
      });
    }
    return this.http.get<any>(`${environment.apiUrl}/exercises/${id}`).pipe(
      map((res) => {
        const localExercise = this.getExerciseById(id) ?? MOCK_EXERCISES.find((exercise) => this.matchesExercise(res.data, exercise));
        return this.mapExerciseItem(res.data, localExercise);
      })
    );
  }

  private mapExerciseItem(item: any = {}, fallback?: ExerciseItem): ExerciseItem {
    const sets = fallback?.sets ?? item.sets;
    const youtubeUrl = fallback?.youtubeUrl || item.youtubeUrl || item.videoUrl || '';

    return {
      id: fallback?.id ?? item.id ?? '',
      title: fallback?.title ?? item.title ?? '',
      category: fallback?.category ?? item.category ?? '',
      icon: fallback?.icon ?? item.icon ?? '',
      sets: typeof sets === 'number' ? `${sets} séries` : String(sets || ''),
      reps: fallback?.reps ?? item.reps ?? '',
      description: fallback?.description ?? item.description ?? '',
      youtubeUrl,
      youtubeStartSeconds: fallback?.youtubeStartSeconds ?? (Number.isFinite(Number(item.youtubeStartSeconds)) ? Number(item.youtubeStartSeconds) : 0),
      videoType: 'youtube',
      hasVideo: fallback?.hasVideo ?? item.hasVideo ?? Boolean(youtubeUrl),
      steps: fallback?.steps ?? item.steps ?? [],
      precautions: fallback?.precautions ?? item.precautions ?? [],
      tone: fallback?.tone ?? item.tone ?? 'blue'
    };
  }

  private matchesExercise(item: any, exercise: ExerciseItem): boolean {
    if (!item) {
      return false;
    }

    return item.id === exercise.id || this.normalizeTitle(item.title) === this.normalizeTitle(exercise.title);
  }

  private normalizeTitle(value: unknown): string {
    return typeof value === 'string'
      ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
      : '';
  }
}
