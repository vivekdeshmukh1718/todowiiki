"use client";

import React, { useState, useEffect } from 'react';
import type { TaskInput as GenkitTaskInput, ScheduleOutput } from '@/ai/flows/generate-schedule';
import { generateSchedule } from '@/ai/flows/generate-schedule';
import { Header } from '@/components/app/Header';
import { TaskInputForm } from '@/components/app/TaskInputForm';
import { ScheduleDisplay } from '@/components/app/ScheduleDisplay';
import type { TaskInput as AppTaskInput, ScheduledTaskItem } from '@/components/app/types';
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs


export default function HomePage() {
  const [tasksToSchedule, setTasksToSchedule] = useState<AppTaskInput[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleAddTask = (taskData: Omit<AppTaskInput, 'id'>) => {
    const newTask: AppTaskInput = { ...taskData, id: uuidv4() };
    setTasksToSchedule((prevTasks) => [...prevTasks, newTask]);
    toast({
      title: "Task Added",
      description: `"${newTask.taskName}" has been added to your list.`,
    });
  };

  const handleRemoveTask = (taskId: string) => {
    setTasksToSchedule((prevTasks) => prevTasks.filter(task => task.id !== taskId));
    toast({
      title: "Task Removed",
      description: "The task has been removed from your list.",
      variant: "destructive"
    });
  };

  const handleGenerateSchedule = async () => {
    if (tasksToSchedule.length === 0) {
      toast({
        title: "No Tasks",
        description: "Please add at least one task to generate a schedule.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const genkitTasks: GenkitTaskInput[] = tasksToSchedule.map(({ id, ...task }) => task);
      const result: ScheduleOutput = await generateSchedule({ tasks: genkitTasks });
      
      if (result.schedule && result.schedule.length > 0) {
        const newScheduledTasks: ScheduledTaskItem[] = result.schedule.map((scheduledItem) => {
          const originalTask = tasksToSchedule.find(t => t.taskName === scheduledItem.taskName);
          return {
            ...scheduledItem,
            id: uuidv4(),
            importance: originalTask?.importance || 'medium',
            estimatedTime: originalTask?.estimatedTime || 0,
            deadline: originalTask?.deadline || '',
            completed: false,
          };
        });
        setScheduledTasks(newScheduledTasks);
        toast({
          title: "Schedule Generated!",
          description: "Your optimal schedule is ready.",
        });
      } else {
        setScheduledTasks([]); // Clear previous schedule if AI returns empty
        toast({
          title: "Schedule Generation Issue",
          description: "The AI couldn't generate a schedule with the provided tasks, or returned an empty schedule. Try adjusting your tasks.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast({
        title: "Error Generating Schedule",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
       setScheduledTasks([]); // Clear schedule on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTaskCompletion = (taskId: string) => {
    setScheduledTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  if (!isClient) {
    // Render a loading state or null on the server to avoid hydration mismatches with uuid
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8 max-w-4xl">
           <div className="flex justify-center items-center h-64">
             <p>Loading Day Weaver...</p>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 max-w-4xl space-y-8">
        <section>
          <TaskInputForm
            onAddTask={handleAddTask}
            currentTasks={tasksToSchedule}
            onRemoveTask={handleRemoveTask}
            onGenerateSchedule={handleGenerateSchedule}
            isLoading={isLoading}
          />
        </section>
        <section>
          <ScheduleDisplay
            scheduledTasks={scheduledTasks}
            onToggleTask={handleToggleTaskCompletion}
          />
        </section>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Powered by Day Weaver AI
      </footer>
    </div>
  );
}
