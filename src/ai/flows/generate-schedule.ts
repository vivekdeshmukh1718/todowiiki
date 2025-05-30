// src/ai/flows/generate-schedule.ts
'use server';
/**
 * @fileOverview Generates an optimal daily schedule based on user-provided tasks, deadlines, importance, and estimated time.
 *
 * - generateSchedule - A function that generates the daily schedule.
 * - TaskInput - The input type for the generateSchedule function.
 * - ScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskInputSchema = z.object({
  taskName: z.string().describe('The name of the task.'),
  deadline: z.string().describe('The deadline for the task (e.g., 2024-04-01T17:00:00Z).'),
  importance: z.enum(['high', 'medium', 'low']).describe('The importance level of the task.'),
  estimatedTime: z
    .number()
    .describe('The estimated time required to complete the task, in minutes.'),
});

export type TaskInput = z.infer<typeof TaskInputSchema>;

const ScheduleOutputSchema = z.object({
  schedule: z
    .array(z.object({
      taskName: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }))
    .describe('The generated schedule for the day.'),
});

export type ScheduleOutput = z.infer<typeof ScheduleOutputSchema>;

const GenerateScheduleInputSchema = z.object({
  tasks: z.array(TaskInputSchema).describe('A list of tasks to schedule.'),
});

export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<ScheduleOutput> {
  return generateScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: GenerateScheduleInputSchema},
  output: {schema: ScheduleOutputSchema},
  prompt: `You are a personal assistant helping users create an optimal daily schedule.

  Given the following list of tasks with their deadlines, importance, and estimated time, generate a schedule that maximizes productivity and meets all deadlines.  Ensure the output is valid JSON that conforms to the schema.  Do not include any conversational text or explanations.

  Tasks:
  {{#each tasks}}
  - Task Name: {{this.taskName}}, Deadline: {{this.deadline}}, Importance: {{this.importance}}, Estimated Time: {{this.estimatedTime}} minutes
  {{/each}}`,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: ScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
