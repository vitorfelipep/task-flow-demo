'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
} from 'lucide-react';
import type { Task, Priority } from '@taskflow/shared';
import { cn, Checkbox, Badge, Button } from '@taskflow/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: Task;
}

const priorityConfig: Record<Priority, { label: string; className: string; variant: 'p1' | 'p2' | 'p3' | 'p4' }> = {
  P1: { label: 'P1', className: 'border-red-500', variant: 'p1' },
  P2: { label: 'P2', className: 'border-orange-500', variant: 'p2' },
  P3: { label: 'P3', className: 'border-blue-500', variant: 'p3' },
  P4: { label: 'P4', className: 'border-gray-300', variant: 'p4' },
};

export function TaskItem({ task }: TaskItemProps) {
  const token = useAuthStore((s) => s.token);
  const { updateTask, removeTask } = useTasksStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const priority = priorityConfig[task.priority as Priority] || priorityConfig.P4;
  const isCompleted = task.status === 'completed';

  const handleToggleComplete = async () => {
    if (!token || isCompleting) return;
    
    setIsCompleting(true);
    const newStatus = isCompleted ? 'pending' : 'completed';
    
    // Optimistic update
    updateTask(task.id, { status: newStatus });

    try {
      const response = await tasksApi.update(token, task.id, { status: newStatus });
      
      if (!response.success) {
        // Revert on error
        updateTask(task.id, { status: task.status });
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao atualizar tarefa',
        });
      } else if (newStatus === 'completed') {
        toast({
          title: '✓ Tarefa concluída!',
          description: task.title,
        });
      }
    } catch {
      updateTask(task.id, { status: task.status });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    if (!token) return;
    
    try {
      const response = await tasksApi.delete(token, task.id);
      
      if (response.success) {
        removeTask(task.id);
        toast({
          title: 'Tarefa removida',
          description: task.title,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao remover tarefa',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao remover tarefa',
      });
    }
    
    setShowMenu(false);
  };

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200',
        isCompleted && 'opacity-60'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggleComplete}
        disabled={isCompleting}
        className={cn('mt-0.5', priority.className)}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium leading-tight',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 z-50 mt-1 w-40 rounded-lg border bg-card p-1 shadow-lg animate-slide-in">
                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Priority */}
          <Badge variant={priority.variant} className="text-xs">
            <Flag className="h-3 w-3 mr-1" />
            {priority.label}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(task.dueDate), 'd MMM', { locale: ptBR })}
            </Badge>
          )}

          {/* Due time */}
          {task.dueTime && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {task.dueTime}
            </Badge>
          )}

          {/* Labels */}
          {task.labels?.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="text-xs"
              style={{ 
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </Badge>
          ))}

          {/* Project */}
          {task.project && !task.project.isInbox && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              {task.project.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
