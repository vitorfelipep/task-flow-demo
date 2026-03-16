'use client';

import { Loader2 } from 'lucide-react';
import type { Task } from '@taskflow/shared';
import { TaskItem } from './task-item';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <h3 className="font-medium text-lg">Nenhuma tarefa</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione uma nova tarefa para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
