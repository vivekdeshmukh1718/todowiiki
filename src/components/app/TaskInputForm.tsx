"use client";

import type { TaskInput } from '@/components/app/types';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, CalendarDays, Clock, AlertTriangle, Info, ShieldAlert, Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  deadline: z.string().min(1, "Deadline is required"), // Using string for datetime-local
  importance: z.enum(["high", "medium", "low"]),
  estimatedTime: z.coerce.number().min(1, "Estimated time must be positive"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskInputFormProps {
  onAddTask: (task: TaskFormValues) => void;
  currentTasks: TaskInput[];
  onRemoveTask: (taskId: string) => void;
  onGenerateSchedule: () => void;
  isLoading: boolean;
}

export function TaskInputForm({
  onAddTask,
  currentTasks,
  onRemoveTask,
  onGenerateSchedule,
  isLoading,
}: TaskInputFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: "",
      deadline: "",
      importance: "medium",
      estimatedTime: 30,
    },
  });

  function onSubmit(values: TaskFormValues) {
    onAddTask(values);
    form.reset();
  }

  const importanceIcons = {
    high: <AlertTriangle className="h-4 w-4 text-red-500" />,
    medium: <ShieldAlert className="h-4 w-4 text-yellow-500" />,
    low: <Info className="h-4 w-4 text-blue-500" />,
  };

  const importanceText = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center"><PlusCircle className="mr-2 h-6 w-6" />Add New Task</CardTitle>
        <CardDescription>Enter task details to add it to your day's plan.</CardDescription>
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
                    <Input placeholder="E.g., Finish report" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importance</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select importance" />
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
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="E.g., 60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </form>
        </Form>

        {currentTasks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Tasks to Schedule ({currentTasks.length})</h3>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-3">
                {currentTasks.map((task) => (
                  <Card key={task.id} className="p-3 flex justify-between items-start bg-background/70">
                    <div>
                      <p className="font-semibold">{task.taskName}</p>
                      <div className="text-xs text-muted-foreground space-x-2">
                        <span className="inline-flex items-center"><CalendarDays className="h-3 w-3 mr-1" /> {new Date(task.deadline).toLocaleString()}</span>
                        <span className="inline-flex items-center">{importanceIcons[task.importance]} {importanceText[task.importance]}</span>
                        <span className="inline-flex items-center"><Clock className="h-3 w-3 mr-1" /> {task.estimatedTime} min</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} aria-label="Remove task">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <Button
              onClick={onGenerateSchedule}
              disabled={isLoading || currentTasks.length === 0}
              className="w-full mt-4"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
