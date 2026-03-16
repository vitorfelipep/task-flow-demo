import { z } from 'zod';

// Helper para transformar string vazia em undefined
const emptyStringToUndefined = z.literal('').transform(() => undefined);

export const colorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal');

// Color que aceita vazio e usa default
const optionalColor = z.union([
  emptyStringToUndefined,
  colorSchema,
]).optional().default('#808080');

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  color: z.union([
    z.literal('').transform(() => '#808080'),
    colorSchema,
  ]).default('#808080'),
});

export const updateProjectSchema = z.object({
  name: z.union([
    emptyStringToUndefined,
    z.string().min(1).max(100),
  ]).optional(),
  color: z.union([
    emptyStringToUndefined,
    colorSchema,
  ]).optional(),
  order: z.number().int().nonnegative().optional(),
});

export const createLabelSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome muito longo'),
  color: z.union([
    z.literal('').transform(() => '#808080'),
    colorSchema,
  ]).default('#808080'),
});

export const updateLabelSchema = z.object({
  name: z.union([
    emptyStringToUndefined,
    z.string().min(1).max(50),
  ]).optional(),
  color: z.union([
    emptyStringToUndefined,
    colorSchema,
  ]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
