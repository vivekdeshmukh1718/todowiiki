import type { TaskInput as GenkitTaskInput } from '@/ai/flows/generate-schedule';

export interface TaskInput extends GenkitTaskInput {
  id: string;
}

export interface ScheduledTaskItem {
  id: string;
  taskName: string;
  startTime: string;
  endTime: string;
  importance: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  deadline: string;
  completed: boolean;
}
