export type ExerciseTone = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'cyan';

export interface ExerciseItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  sets: string;
  reps: string;
  description: string;
  youtubeUrl: string;
  youtubeStartSeconds?: number;
  videoType: 'youtube';
  hasVideo: boolean;
  steps: readonly string[];
  precautions: readonly string[];
  tone: ExerciseTone;
}
