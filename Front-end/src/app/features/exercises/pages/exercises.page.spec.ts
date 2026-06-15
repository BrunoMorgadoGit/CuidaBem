import { Injector, runInInjectionContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';

import { ExercisesService } from '../services/exercises.service';
import { ExercisesPage } from './exercises.page';

function createPage(): ExercisesPage {
  const injector = Injector.create({
    providers: [
      ExercisesService,
      {
        provide: DomSanitizer,
        useValue: {
          bypassSecurityTrustResourceUrl: (value: string) => value
        }
      }
    ]
  });

  return runInInjectionContext(injector, () => new ExercisesPage());
}

describe('ExercisesPage', () => {
  it('loads exactly ten recurring exercise tutorials with videos', () => {
    const page = createPage();

    expect(page.totalExercises).toBe(10);
    expect(page.videoExercises).toBe(10);
    expect(page.exercises.map((exercise) => exercise.title)).toEqual([
      'Elevar os calcanhares',
      'Extensão de pernas sentado',
      'Ponta dos pés com apoio',
      'Rotação de ombros',
      'Flexão dos braços sentado',
      'Tirar o quadril da cadeira',
      'Círculos com tornozelos',
      'Abrir e fechar as mãos',
      'Elevação dos braços',
      'Alongamento lateral sentado'
    ]);
    expect(page.exercises.every((exercise) => exercise.hasVideo && exercise.videoType === 'youtube')).toBe(true);
  });

  it('opens and closes a tutorial without marking the exercise as completed', () => {
    const page = createPage();
    const exercise = page.exercises[0];

    page.openExercise(exercise);
    expect(page.activeExercise?.id).toBe('exercise-heel-raise');
    expect(page.exercises).toContain(exercise);

    page.closeTutorial();
    expect(page.activeExercise).toBeNull();
    expect(page.totalExercises).toBe(10);
  });

  it('builds youtube embed urls with optional start seconds', () => {
    const page = createPage();
    const exercise = {
      ...page.exercises[1],
      youtubeStartSeconds: 180
    };

    expect(page.getYoutubeEmbedUrl(exercise)).toBe('https://www.youtube.com/embed/49E33qYS-Ms?modestbranding=1&rel=0&start=180');
  });

  it('returns null safe video url when an exercise has no registered video', () => {
    const page = createPage();
    const exercise = {
      ...page.exercises[0],
      hasVideo: false,
      youtubeUrl: ''
    };

    expect(page.getSafeVideoUrl(exercise)).toBeNull();
  });
});
