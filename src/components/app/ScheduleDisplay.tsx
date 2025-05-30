"use client";

import type { ScheduledTaskItem } from '@/components/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarClock, Clock, AlertTriangle, Info, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleDisplayProps {
  scheduledTasks: ScheduledTaskItem[];
  onToggleTask: (taskId: string) => void;
}

export function ScheduleDisplay({ scheduledTasks, onToggleTask }: ScheduleDisplayProps) {
  if (scheduledTasks.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No schedule generated yet. Add some tasks and click "Generate Schedule".
          </p>
        </CardContent>
      </Card>
    );
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
  
  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString; // fallback if date is not valid
    }
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Today's Plan</CardTitle>
        <CardDescription>Here is your AI-optimized schedule. Check off tasks as you complete them.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {scheduledTasks.map((task) => (
              <Card key={task.id} className={cn("transition-all", task.completed ? "bg-muted/50" : "bg-card")}>
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1"
                    aria-labelledby={`task-label-${task.id}`}
                  />
                  <div className="grid gap-1 flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      id={`task-label-${task.id}`}
                      className={cn(
                        "font-semibold text-lg cursor-pointer",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.taskName}
                    </label>
                    <p className={cn("text-sm text-muted-foreground flex items-center", task.completed && "line-through")}>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {formatTime(task.startTime)} - {formatTime(task.endTime)}
                    </p>
                  </div>
                  {task.completed ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/50" />}
                </CardHeader>
                <CardContent className="p-4 pt-0 pl-12">
                   <div className="text-xs text-muted-foreground space-x-3">
                      <Badge variant={task.completed ? "outline" : "secondary"} className="inline-flex items-center gap-1">
                        {importanceIcons[task.importance]} {importanceText[task.importance]}
                      </Badge>
                      <Badge variant={task.completed ? "outline" : "secondary"} className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {task.estimatedTime} min
                      </Badge>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
