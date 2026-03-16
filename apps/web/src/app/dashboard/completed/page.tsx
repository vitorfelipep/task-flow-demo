'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi } from '@/lib/api';
import { TaskList } from '@/components/tasks/task-list';
import { toast } from '@/hooks/use-toast';
import type { Task } from '@taskflow/shared';

export default function CompletedPage() {
  const token = useAuthStore((s) => s.token);
  const { tasks, setTasks, setCurrentView, setLoading, isLoading } = useTasksStore();

  useEffect(() => {
    setCurrentView('completed');
  }, [setCurrentView]);

  useEffect(() => {
    if (!token) return;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const response = await tasksApi.list(token, { status: 'completed' });
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

  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-3xl mx-auto">
      {/* View Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Concluídas</h2>
          <p className="text-sm text-muted-foreground">
            {completedTasks.length} tarefa{completedTasks.length !== 1 ? 's' : ''} concluída{completedTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <TaskList tasks={completedTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
