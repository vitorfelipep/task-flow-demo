'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { createProjectSchema, type CreateProjectInput } from '@taskflow/shared';
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
import { projectsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const COLORS = [
  '#808080', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#F8B500', '#00CED1', '#FF6347', '#7B68EE',
];

interface AddProjectDialogProps {
  trigger?: React.ReactNode;
}

export function AddProjectDialog({ trigger }: AddProjectDialogProps) {
  const token = useAuthStore((s) => s.token);
  const { addProject } = useTasksStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      color: COLORS[0],
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await projectsApi.create(token, {
        ...data,
        color: selectedColor,
      });

      if (response.success && response.data) {
        addProject(response.data as any);
        toast({
          title: 'Projeto criado!',
          description: data.name,
        });
        reset();
        setSelectedColor(COLORS[0]);
        setOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: response.error?.message || 'Erro ao criar projeto',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao criar projeto',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Novo projeto
        </button>
      )}

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Novo projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do projeto</Label>
              <Input
                id="name"
                placeholder="Ex: Trabalho, Pessoal..."
                {...register('name')}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      selectedColor === color
                        ? 'ring-2 ring-offset-2 ring-violet-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
                'Criar projeto'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
