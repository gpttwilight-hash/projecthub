export type ProjectStatus = 'active' | 'paused' | 'completed' | 'idea';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  techStack: string[];
  githubUrl: string;
  lastSessionNotes: string;
  problems: string[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_CONFIG = {
  active:    { label: 'Active',    color: '#00e87a', bg: 'rgba(0,232,122,0.1)',   border: 'rgba(0,232,122,0.25)' },
  paused:    { label: 'Paused',    color: '#ffb300', bg: 'rgba(255,179,0,0.1)',   border: 'rgba(255,179,0,0.25)' },
  completed: { label: 'Completed', color: '#4d9fff', bg: 'rgba(77,159,255,0.1)',  border: 'rgba(77,159,255,0.25)' },
  idea:      { label: 'Idea',      color: '#bf7fff', bg: 'rgba(191,127,255,0.1)', border: 'rgba(191,127,255,0.25)' },
} as const;

export const PROGRESS_GRADIENT = {
  active:    'linear-gradient(90deg, #00e87a, #00d4ff)',
  paused:    'linear-gradient(90deg, #ffb300, #ff7c00)',
  completed: 'linear-gradient(90deg, #4d9fff, #a855f7)',
  idea:      'linear-gradient(90deg, #bf7fff, #f0abfc)',
};
