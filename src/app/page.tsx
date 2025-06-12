
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
      } catch (error) {
        console.error("Failed to parse tasks from local storage:", error);
        localStorage.removeItem('dayWeaverTasks');
      }
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('dayWeaverTasks') !== null) {
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
              const audio = new Audio('/sounds/alarm.mp3');

              audio.onerror = () => {
                let toastTitle = "Audio File Load Error";
                let toastDescription = "Failed to load alarm.mp3. Ensure it's at public/sounds/alarm.mp3 and is valid. Check console for details.";
                let consoleErrorMessage = "Error loading audio file. Check path and file integrity: /sounds/alarm.mp3.";

                if (audio.error) {
                  const errorCode = audio.error.code;
                  const errorMessage = audio.error.message || 'No specific message.';
                  consoleErrorMessage = `Error loading audio file. Check path and file integrity: /sounds/alarm.mp3. MediaError details: Code: ${errorCode}, Message: ${errorMessage}`;
                  console.error(consoleErrorMessage, audio.error); 

                  if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED (often format/corruption)
                    toastTitle = "Audio File Format/Corruption Error";
                    toastDescription = `The alarm.mp3 file (at public/sounds/) appears to be corrupted or in a format your browser cannot play (Error Code: 4 - ${errorMessage}). Please replace it with a valid MP3 file. Test the MP3 in a desktop player first.`;
                  } else {
                    // General error if audio.error exists but is not code 4
                    toastDescription = `Failed to load alarm.mp3. Error Code: ${errorCode} - ${errorMessage}. Ensure it's at public/sounds/alarm.mp3 and is valid. Check console.`;
                  }
                } else {
                  // Fallback if audio.error object itself is null
                  console.error(consoleErrorMessage, "audio.error object was null or undefined.");
                  toastDescription = "Failed to load alarm.mp3. An unknown audio error occurred. Ensure the file is at public/sounds/alarm.mp3 and is valid. Check console.";
                }
                
                toast({
                  title: toastTitle,
                  description: toastDescription,
                  variant: "destructive",
                });
              };

              audio.play().catch(error => {
                console.warn("Error playing alarm sound:", error.message, "This often happens if the browser blocked autoplay. Ensure user has interacted with the page.");
                 toast({
                    title: "Audio Playback Blocked/Failed",
                    description: "Browser may have blocked sound or it failed to play. Please interact with the page first. Check console.",
                    variant: "destructive",
                });
              });
            } catch (e) {
              console.error("Could not initialize Audio object. This is an unexpected error.", e);
               toast({
                  title: "Audio Initialization Error",
                  description: "An unexpected error occurred setting up the alarm sound. Please check console.",
                  variant: "destructive",
              });
            }
            setFiredAlarms(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    const intervalId = setInterval(checkAlarms, 10000); // Check every 10 seconds

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
