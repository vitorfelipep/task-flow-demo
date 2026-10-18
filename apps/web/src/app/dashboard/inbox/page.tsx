'use client';

import { useEffect, useState } from 'react';
import { Inbox } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi, projectsApi } from '@/lib/api';
import { TaskList } from '@/components/tasks/task-list';
import { AddTaskButton } from '@/components/tasks/add-task-button';
import { toast } from '@/hooks/use-toast';
import type { Task, Project } from '@taskflow/shared';

export default function InboxPage() {
  const [reloadVersion, setReloadVersion] = useState(0);
  const token = useAuthStore((s) => s.token);
  const { tasks, projects, setTasks, setCurrentView, setLoading, isLoading } = useTasksStore();

  useEffect(() => {
    setCurrentView('inbox');
  }, [setCurrentView]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const loadTasks = async () => {
      setLoading(true);
      try {
        // Find inbox project
        let inboxId = projects.find((p) => p.isInbox)?.id;
        
        if (!inboxId) {
          const projectsRes = await projectsApi.list(token);
          if (projectsRes.success) {
            const projectsList = projectsRes.data as Project[];
            inboxId = projectsList.find((p) => p.isInbox)?.id;
          }
        }

        if (inboxId) {
          const response = await tasksApi.list(token, { projectId: inboxId, status: 'pending' });
          if (cancelled) return;
          if (!response.success) throw new Error(response.error?.message);
          if (response.success) {
            setTasks((response.data as Task[]) || []);
          }
        }
      } catch {
        if (cancelled) return;
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar tarefas',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [token, projects, setTasks, setLoading, reloadVersion]);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="max-w-3xl mx-auto">
      {/* View Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Inbox className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Inbox</h2>
          <p className="text-sm text-muted-foreground">Tarefas não organizadas em projetos</p>
        </div>
      </div>

      <AddTaskButton onTaskCreated={() => setReloadVersion((version) => version + 1)} />

      <div className="mt-6">
        <TaskList tasks={pendingTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
