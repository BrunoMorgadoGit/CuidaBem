import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { PageShellComponent } from '../../../shared/components/page-shell/page-shell.component';
import { trackById } from '../../../shared/utils';
import type { ExerciseItem } from '../models';
import { ExercisesService } from '../services/exercises.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [CommonModule, PageShellComponent],
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.css'],
})
export class ExercisesPage implements OnInit {
  private readonly exercisesService = inject(ExercisesService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly trackByExerciseId = trackById<ExerciseItem>;

  exercises: ExerciseItem[] = [];
  activeExercise: ExerciseItem | null = null;

  constructor() {
    try {
      this.exercises = [...(this.exercisesService.getExercises() || [])];
    } catch {
      this.exercises = [];
    }
  }

  ngOnInit(): void {
    this.exercisesService.getExercisesApi().subscribe({
      next: (res) => {
        this.exercises = res;
      }
    });
  }

  get totalExercises(): number {
    return this.exercises.length;
  }

  get videoExercises(): number {
    return this.exercises.filter((exercise) => exercise.hasVideo && exercise.videoType === 'youtube').length;
  }

  openExercise(exercise: ExerciseItem): void {
    this.activeExercise = this.findExercise(exercise.id) ?? exercise;
  }

  closeTutorial(): void {
    this.activeExercise = null;
  }

  getSafeVideoUrl(exercise: ExerciseItem | null): SafeResourceUrl | null {
    if (!exercise?.hasVideo) {
      return null;
    }

    const embedUrl = this.getYoutubeEmbedUrl(exercise);

    return embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  }

  getYoutubeEmbedUrl(exercise: ExerciseItem): string {
    const videoId = this.extractYoutubeId(exercise.youtubeUrl);
    if (!videoId) {
      return '';
    }

    const startSeconds = Math.max(0, Math.floor(exercise.youtubeStartSeconds ?? 0));
    const queryParams = new URLSearchParams({
      modestbranding: '1',
      rel: '0'
    });

    if (startSeconds > 0) {
      queryParams.set('start', String(startSeconds));
    }

    return `https://www.youtube.com/embed/${videoId}?${queryParams.toString()}`;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeTutorial();
  }

  private findExercise(exerciseId: string): ExerciseItem | undefined {
    return this.exercises.find((exercise) => exercise.id === exerciseId);
  }

  private extractYoutubeId(youtubeUrl: string): string {
    try {
      const parsedUrl = new URL(youtubeUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./, '');

      if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
        const watchId = parsedUrl.searchParams.get('v');
        const embedMatch = parsedUrl.pathname.match(/^\/embed\/([A-Za-z0-9_-]{6,})/);
        const videoId = watchId || embedMatch?.[1] || '';

        return /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : '';
      }

      if (hostname === 'youtu.be') {
        const videoId = parsedUrl.pathname.replace('/', '');
        return /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : '';
      }
    } catch {
      return '';
    }

    return '';
  }
}
