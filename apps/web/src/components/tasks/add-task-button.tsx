'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Calendar, Flag, X, Loader2 } from 'lucide-react';
import { createTaskSchema, type CreateTaskInput } from '@taskflow/shared';
import {
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@taskflow/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useTasksStore } from '@/stores/tasks-store';
import { tasksApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export function AddTaskButton() {
  const token = useAuthStore((s) => s.token);
  const { projects, addTask } = useTasksStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'P4',
    },
  });

  const selectedPriority = watch('priority');

  const onSubmit = async (data: CreateTaskInput) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await tasksApi.create(token, data);
      
      if (response.success && response.data) {
        addTask(response.data as any);
        toast({
          title: 'Tarefa criada!',
          description: data.title,
        });
        reset();
        setOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: response.error?.message || 'Erro ao criar tarefa',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar tarefa',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const priorities = [
    { value: 'P1', label: 'P1', color: 'text-red-500' },
    { value: 'P2', label: 'P2', color: 'text-orange-500' },
    { value: 'P3', label: 'P3', color: 'text-blue-500' },
    { value: 'P4', label: 'P4', color: 'text-gray-400' },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 text-muted-foreground hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all duration-200"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
          <Plus className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <span className="font-medium">Adicionar tarefa</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova tarefa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Revisar relatório mensal"
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Adicione mais detalhes..."
                  {...register('description')}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Data</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dueDate"
                      type="date"
                      className="pl-10"
                      {...register('dueDate')}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueTime">Hora</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    {...register('dueTime')}
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue('priority', p.value as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedPriority === p.value
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      <Flag className={`h-3.5 w-3.5 ${p.color}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <Label htmlFor="projectId">Projeto</Label>
                <select
                  id="projectId"
                  {...register('projectId')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Inbox</option>
                  {projects
                    .filter((p) => !p.isInbox)
                    .map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-violet-500 to-purple-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar tarefa'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
