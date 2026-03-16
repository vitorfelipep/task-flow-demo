import { z } from 'zod';

export const prioritySchema = z.enum(['P1', 'P2', 'P3', 'P4']);
export const taskStatusSchema = z.enum(['pending', 'completed']);

// Helper para transformar string vazia em undefined
const emptyStringToUndefined = z.literal('').transform(() => undefined);

// Schema para data (aceita YYYY-MM-DD ou datetime ISO)
const dateSchema = z.union([
  emptyStringToUndefined,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido'),
  z.string().datetime(),
]).optional();

// Schema para hora (aceita HH:MM)
const timeSchema = z.union([
  emptyStringToUndefined,
  z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
]).optional();

// Schema para UUID opcional (aceita string vazia como undefined)
const optionalUuid = z.union([
  emptyStringToUndefined,
  z.string().min(1),
]).optional();

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(500, 'Título muito longo'),
  description: z.union([
    emptyStringToUndefined,
    z.string().max(5000, 'Descrição muito longa'),
  ]).optional(),
  priority: prioritySchema.default('P4'),
  dueDate: dateSchema,
  dueTime: timeSchema,
  projectId: optionalUuid,
  labelIds: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
  order: z.number().int().nonnegative().optional(),
});

export const taskFiltersSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  projectId: optionalUuid,
  labelId: optionalUuid,
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  search: z.union([
    emptyStringToUndefined,
    z.string().max(100),
  ]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;
