
"use client";

import type { AppTask } from '@/components/app/types';
import { Header } from '@/components/app/Header';
import { TaskInputForm } from '@/components/app/TaskInputForm';
import { ScheduleDisplay } from '@/components/app/ScheduleDisplay';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const { toast } = useToast();
  const [firedAlarms, setFiredAlarms] = useState<Set<string>>(new Set());

  useEffect(() => {
    const storedTasks = localStorage.getItem('dayWeaverTasks');
    if (storedTasks) {
      try {
        const parsedTasks: AppTask[] = JSON.parse(storedTasks);
        setTasks(parsedTasks);
        const initialFired = new Set<string>();
        parsedTasks.forEach(task => {
          if (task.alarmTime && new Date(task.alarmTime) <= new Date() && task.completed) {
            initialFired.add(task.id);
          }
        });
        setFiredAlarms(initialFired);
      } catch (error) {
        console.error("Failed to parse tasks from local storage:", error);
        localStorage.removeItem('dayWeaverTasks'); 
      }
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('dayWeaverTasks')) {
         localStorage.setItem('dayWeaverTasks', JSON.stringify(tasks));
    }
  }, [tasks]);


  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.alarmTime && !task.completed && !firedAlarms.has(task.id)) {
          const alarmTime = new Date(task.alarmTime);
          if (alarmTime <= now) {
            toast({
              title: "⏰ Alarm!",
              description: `Time for: ${task.taskName}`,
            });
            try {
              // Assumes you have an alarm.mp3 file in your public/sounds/ directory
              const audio = new Audio('/sounds/alarm.mp3');
              audio.play().catch(error => {
                // Autoplay might be blocked by the browser if the user hasn't interacted with the page yet
                console.warn("Error playing alarm sound:", error.message, "Ensure user has interacted with the page or check browser autoplay policies.");
                 toast({
                    title: "Audio Playback Blocked",
                    description: "Browser prevented alarm sound. Please interact with the page first.",
                    variant: "destructive",
                });
              });
            } catch (e) {
              console.error("Could not play audio. Make sure /sounds/alarm.mp3 exists in your public directory.", e);
               toast({
                  title: "Audio File Error",
                  description: "Could not load alarm.mp3. Please check console.",
                  variant: "destructive",
              });
            }
            setFiredAlarms(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    const intervalId = setInterval(checkAlarms, 10000); 
    checkAlarms(); 

    return () => clearInterval(intervalId);
  }, [tasks, toast, firedAlarms]);

  const handleAddTask = (taskData: Omit<AppTask, 'id' | 'completed'>) => {
    const newTask: AppTask = {
      ...taskData,
      id: uuidv4(),
      completed: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    setFiredAlarms(prev => {
      const newFired = new Set(prev);
      newFired.delete(taskId);
      return newFired;
    });
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleSetTaskAlarm = (taskId: string, alarmTime?: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, alarmTime };
          if (!alarmTime || (task.alarmTime && alarmTime !== task.alarmTime)) {
             setFiredAlarms(prev => {
                const newFired = new Set(prev);
                newFired.delete(taskId);
                return newFired;
            });
          }
          return updatedTask;
        }
        return task;
      })
    );
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/30">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <TaskInputForm onAddTask={handleAddTask} />
          </div>
          <div className="md:col-span-2">
            <ScheduleDisplay
              tasks={tasks}
              onToggleTask={handleToggleTaskComplete}
              onRemoveTask={handleRemoveTask}
              onSetAlarm={handleSetTaskAlarm}
            />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        Day Weaver - Your Personal Task Manager
      </footer>
    </div>
  );
}
