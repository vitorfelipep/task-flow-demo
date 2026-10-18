'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Flag, Loader2 } from 'lucide-react';
import { updateTaskSchema, type UpdateTaskInput, type Task } from '@taskflow/shared';
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

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const token = useAuthStore((s) => s.token);
  const { projects, updateTask } = useTasksStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      dueTime: task.dueTime || '',
      projectId: task.projectId,
    },
  });

  const selectedPriority = watch('priority');

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        dueTime: task.dueTime || '',
        projectId: task.projectId,
      });
    }
  }, [open, task, reset]);

  const onSubmit = async (data: UpdateTaskInput) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await tasksApi.update(token, task.id, data);
      
      if (response.success && response.data) {
        updateTask(task.id, response.data as any);
        toast({
          title: 'Tarefa atualizada!',
          description: data.title,
        });
        onOpenChange(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: response.error?.message || 'Erro ao atualizar tarefa',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao atualizar tarefa',
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
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
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Input
                id="edit-description"
                placeholder="Adicione mais detalhes..."
                {...register('description')}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Data</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-dueDate"
                    type="date"
                    className="pl-10"
                    {...register('dueDate')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueTime">Hora</Label>
                <Input
                  id="edit-dueTime"
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
              <Label htmlFor="edit-projectId">Projeto</Label>
              <select
                id="edit-projectId"
                {...register('projectId')}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {projects.map((project) => (
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
              onClick={() => onOpenChange(false)}
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
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
