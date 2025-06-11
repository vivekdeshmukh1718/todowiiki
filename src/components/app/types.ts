
// This will be the primary task type for the user-managed to-do list
export interface AppTask {
  id: string;
  taskName: string;
  deadline: string; // ISO string for datetime-local compatibility
  importance: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  alarmTime?: string; // ISO string, optional
  completed: boolean;
}

// This type is specific to the output of the AI scheduling flow (if used in the future)
export interface ScheduledTaskItemByAI {
  id: string;
  taskName: string;
  startTime: string;
  endTime: string;
  // Original AI flow output doesn't include all AppTask fields.
  // This type is kept for potential future use with the AI scheduler.
}

// Original Genkit types from the AI flow, kept for reference if AI feature is re-integrated.
// import type { TaskInput as GenkitTaskInput } from '@/ai/flows/generate-schedule';
// export interface TaskInput extends GenkitTaskInput {
//   id: string;
// }
