
"use client";

import type { AppTask } from '@/components/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarClock, Clock, AlertTriangle, Info, ShieldAlert, CheckCircle2, Circle, Trash2, BellPlus, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ScheduleDisplayProps {
  tasks: AppTask[];
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  onSetAlarm: (taskId: string, alarmTime?: string) => void;
}

export function ScheduleDisplay({ tasks, onToggleTask, onRemoveTask, onSetAlarm }: ScheduleDisplayProps) {
  const [editingAlarm, setEditingAlarm] = useState<{ taskId: string; currentAlarm?: string } | null>(null);
  const [alarmInput, setAlarmInput] = useState<string>("");


  useEffect(() => {
    if (editingAlarm?.currentAlarm) {
      try {
        const date = new Date(editingAlarm.currentAlarm);
        const localDateTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        setAlarmInput(localDateTime);
      } catch (e) {
        setAlarmInput("");
      }
    } else {
      setAlarmInput("");
    }
  }, [editingAlarm]);


  if (tasks.length === 0) {
    return (
      <Card className="shadow-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-primary">Your Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12 text-lg">
            No tasks yet. Add some tasks using the form!
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
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const handleSaveAlarm = (taskId: string) => {
    if (alarmInput) {
      onSetAlarm(taskId, new Date(alarmInput).toISOString());
    } else {
      onSetAlarm(taskId, undefined); // Clear alarm
    }
    setEditingAlarm(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0; 
  });


  return (
    <Card className="shadow-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Today's Tasks ({tasks.filter(t => !t.completed).length} pending)</CardTitle>
        <CardDescription>Here are your tasks. Stay organized and productive!</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-3">
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <Card
                key={task.id}
                className={cn(
                  "transition-all duration-300 ease-in-out hover:shadow-lg",
                  task.completed ? "bg-muted/30 border-green-500/30" : "bg-card",
                  task.alarmTime && !task.completed && new Date(task.alarmTime) <= new Date() ? "border-2 border-accent animate-pulse-border-once" : ""
                )}
              >
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1 h-5 w-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                     <div className="text-xs text-muted-foreground space-y-1">
                        <p className={cn("flex items-center", task.completed && "line-through")}>
                            <CalendarClock className="mr-2 h-4 w-4 text-primary/70" />
                            Deadline: {formatDateTime(task.deadline)}
                        </p>
                        <div className={cn("flex items-center", task.completed && "line-through")}>
                            <CalendarClock className="mr-2 h-4 w-4 text-accent/70" />
                            Alarm: {formatDateTime(task.alarmTime)}
                            {task.alarmTime && !task.completed && new Date(task.alarmTime) <= new Date() && (
                                <Badge variant="destructive" className="ml-2 animate-pulse"></Badge>
                            )}
                        </div>
                    </div>
                  </div>
                  {task.completed ? <CheckCircle2 className="h-6 w-6 text-green-500" /> : <Circle className="h-6 w-6 text-muted-foreground/30" />}
                </CardHeader>
                <CardContent className="p-4 pt-0 pl-12 space-y-2">
                   <div className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                      <Badge variant={task.completed ? "outline" : "secondary"} className="inline-flex items-center gap-1 py-1 px-2 text-xs">
                        {importanceIcons[task.importance]} {importanceText[task.importance]}
                      </Badge>
                      <Badge variant={task.completed ? "outline" : "secondary"} className="inline-flex items-center gap-1 py-1 px-2 text-xs">
                        <Clock className="h-3 w-3" /> {task.estimatedTime} min
                      </Badge>
                   </div>
                </CardContent>
                <CardFooter className="p-2 pl-12 pr-4 border-t mt-2 flex justify-end space-x-2">
                    <Popover open={editingAlarm?.taskId === task.id} onOpenChange={(isOpen) => { if (!isOpen) setEditingAlarm(null); }}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingAlarm({ taskId: task.id, currentAlarm: task.alarmTime })}>
                          {task.alarmTime ? <BellOff className="h-4 w-4 mr-1" /> : <BellPlus className="h-4 w-4 mr-1" />}
                          {task.alarmTime ? "Change Alarm" : "Set Alarm"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4 space-y-2">
                        <p className="font-medium text-sm">Set alarm for "{task.taskName}"</p>
                        <Input
                            type="datetime-local"
                            value={alarmInput}
                            onChange={(e) => setAlarmInput(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            {task.alarmTime && <Button variant="outline" size="sm" onClick={() => { onSetAlarm(task.id, undefined); setEditingAlarm(null); }}>Clear Alarm</Button>}
                            <Button size="sm" onClick={() => handleSaveAlarm(task.id)}>Save Alarm</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveTask(task.id)} aria-label="Remove task" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
