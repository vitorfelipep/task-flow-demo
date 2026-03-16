'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Sun, Calendar, Inbox, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi, projectsApi, labelsApi } from '@/lib/api';
import { TaskList } from '@/components/tasks/task-list';
import { AddTaskButton } from '@/components/tasks/add-task-button';
import { toast } from '@/hooks/use-toast';
import type { Task, Project, Label } from '@taskflow/shared';

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const { 
    tasks, 
    currentView, 
    setTasks, 
    setProjects, 
    setLabels, 
    setLoading, 
    isLoading 
  } = useTasksStore();

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [tasksRes, projectsRes, labelsRes] = await Promise.all([
          tasksApi.today(token),
          projectsApi.list(token),
          labelsApi.list(token),
        ]);

        if (tasksRes.success) {
          setTasks((tasksRes.data as Task[]) || []);
        }
        if (projectsRes.success) {
          setProjects((projectsRes.data as Project[]) || []);
        }
        if (labelsRes.success) {
          setLabels((labelsRes.data as Label[]) || []);
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao carregar dados',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, setTasks, setProjects, setLabels, setLoading]);

  const viewConfig = {
    today: {
      title: 'Hoje',
      icon: Sun,
      subtitle: format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR }),
    },
    upcoming: {
      title: 'Próximos',
      icon: Calendar,
      subtitle: 'Tarefas dos próximos 7 dias',
    },
    inbox: {
      title: 'Inbox',
      icon: Inbox,
      subtitle: 'Tarefas não organizadas',
    },
    completed: {
      title: 'Concluídas',
      icon: CheckCircle,
      subtitle: 'Tarefas finalizadas',
    },
    project: {
      title: 'Projeto',
      icon: Inbox,
      subtitle: '',
    },
    label: {
      title: 'Etiqueta',
      icon: Inbox,
      subtitle: '',
    },
  };

  const config = viewConfig[currentView];
  const Icon = config.icon;

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Você tem {pendingTasks.length} tarefa{pendingTasks.length !== 1 ? 's' : ''} para hoje
        </p>
      </div>

      {/* View Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{config.title}</h2>
          <p className="text-sm text-muted-foreground capitalize">{config.subtitle}</p>
        </div>
      </div>

      {/* Add Task Button */}
      <AddTaskButton />

      {/* Task List */}
      <div className="mt-6">
        <TaskList tasks={pendingTasks} isLoading={isLoading} />
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Concluídas ({completedTasks.length})
          </h3>
          <TaskList tasks={completedTasks} isLoading={false} />
        </div>
      )}
    </div>
  );
}
