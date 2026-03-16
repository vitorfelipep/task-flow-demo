'use client';

import { useEffect } from 'react';
import { Inbox } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi, projectsApi } from '@/lib/api';
import { TaskList } from '@/components/tasks/task-list';
import { AddTaskButton } from '@/components/tasks/add-task-button';
import { toast } from '@/hooks/use-toast';
import type { Task, Project } from '@taskflow/shared';

export default function InboxPage() {
  const token = useAuthStore((s) => s.token);
  const { tasks, projects, setTasks, setCurrentView, setLoading, isLoading } = useTasksStore();

  useEffect(() => {
    setCurrentView('inbox');
  }, [setCurrentView]);

  useEffect(() => {
    if (!token) return;

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
          if (response.success) {
            setTasks((response.data as Task[]) || []);
          }
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
  }, [token, projects, setTasks, setLoading]);

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

      <AddTaskButton />

      <div className="mt-6">
        <TaskList tasks={pendingTasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
