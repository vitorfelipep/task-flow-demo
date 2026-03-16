'use client';

import { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi } from '@/lib/api';
import { TaskList } from '@/components/tasks/task-list';
import { AddTaskButton } from '@/components/tasks/add-task-button';
import { toast } from '@/hooks/use-toast';
import type { Task } from '@taskflow/shared';

export default function UpcomingPage() {
  const token = useAuthStore((s) => s.token);
  const { tasks, setTasks, setLoading, setCurrentView, isLoading } = useTasksStore();

  useEffect(() => {
    setCurrentView('upcoming');
  }, [setCurrentView]);

  useEffect(() => {
    if (!token) return;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await tasksApi.upcoming(token);
        if (response.success) {
          setTasks((response.data as Task[]) || []);
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar tarefas',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [token, setTasks, setLoading]);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="max-w-3xl mx-auto">
      {/* View Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Próximos</h2>
          <p className="text-sm text-muted-foreground">Tarefas dos próximos 7 dias</p>
        </div>
      </div>

      <AddTaskButton />

      <div className="mt-6">
        <TaskList tasks={pendingTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
