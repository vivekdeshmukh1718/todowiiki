
"use client";

import type { AppTask } from '@/components/app/types';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, CalendarClock } from "lucide-react";

const taskFormSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  deadline: z.string().refine(val => val === '' || !isNaN(new Date(val).getTime()), {
    message: "Invalid date format for deadline",
  }).optional().or(z.literal('')), // Making deadline optional
  importance: z.enum(["high", "medium", "low"]),
  estimatedTime: z.coerce.number().min(1, "Estimated time must be positive"),
  alarmTime: z.string().refine(val => val === '' || !isNaN(new Date(val).getTime()), {
    message: "Invalid date format for alarm",
  }).optional().or(z.literal('')),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskInputFormProps {
  onAddTask: (task: Omit<AppTask, 'id' | 'completed'>) => void;
}

export function TaskInputForm({ onAddTask }: TaskInputFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      taskName: "",
      deadline: "",
      importance: "medium",
      estimatedTime: 30,
      alarmTime: "",
    },
  });

  function onSubmit(values: TaskFormValues) {
    const taskData: Omit<AppTask, 'id' | 'completed'> = {
      taskName: values.taskName,
      // Ensure deadline is only passed if it's a valid date string, otherwise pass undefined
      deadline: values.deadline && values.deadline !== '' ? new Date(values.deadline).toISOString() : new Date().toISOString(), // Default to now if not set
      importance: values.importance,
      estimatedTime: values.estimatedTime,
      alarmTime: values.alarmTime && values.alarmTime !== '' ? new Date(values.alarmTime).toISOString() : undefined,
    };
    onAddTask(taskData);
    form.reset();
  }

  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center text-primary">
          <PlusCircle className="mr-3 h-7 w-7" />Add New Task
        </CardTitle>
        <CardDescription>Plan your day by adding tasks below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="taskName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Finish report, Call John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="E.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="alarmTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4 text-accent" />
                    Set Alarm (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>Get a notification if the app is open.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Task to List
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
