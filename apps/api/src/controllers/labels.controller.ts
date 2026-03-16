import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@taskflow/database';
import { createLabelSchema, updateLabelSchema } from '@taskflow/shared';
import { AppError } from '../middlewares/error-handler';

/**
 * Labels Controller
 * Handles all label-related operations
 */
export class LabelsController {
  /**
   * Get all labels for the current user
   * GET /api/labels
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const labels = await prisma.label.findMany({
        where: { userId },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const labelsWithCount = labels.map((l) => ({
        id: l.id,
        name: l.name,
        color: l.color,
        taskCount: l._count.tasks,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));

      res.json({
        success: true,
        data: labelsWithCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single label by ID with its tasks
   * GET /api/labels/:id
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const includeCompleted = req.query.includeCompleted === 'true';

      const label = await prisma.label.findFirst({
        where: { id, userId },
        include: {
          tasks: {
            include: {
              task: {
                include: {
                  project: true,
                  labels: { include: { label: true } },
                },
              },
            },
            where: includeCompleted
              ? {}
              : { task: { status: 'pending' } },
          },
          _count: {
            select: { tasks: true },
          },
        },
      });

      if (!label) {
        throw new AppError(404, 'LABEL_NOT_FOUND', 'Etiqueta não encontrada');
      }

      const transformedLabel = {
        id: label.id,
        name: label.name,
        color: label.color,
        taskCount: label._count.tasks,
        createdAt: label.createdAt,
        updatedAt: label.updatedAt,
        tasks: label.tasks.map((tl) => ({
          ...tl.task,
          labels: tl.task.labels.map((l) => l.label),
        })),
      };

      res.json({
        success: true,
        data: transformedLabel,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new label
   * POST /api/labels
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLabelSchema.parse(req.body);
      const userId = req.user!.userId;

      // Check if label name already exists
      const existing = await prisma.label.findUnique({
        where: { userId_name: { userId, name: data.name.toLowerCase() } },
      });

      if (existing) {
        throw new AppError(409, 'LABEL_EXISTS', 'Etiqueta já existe');
      }

      const label = await prisma.label.create({
        data: {
          name: data.name.toLowerCase(),
          color: data.color,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        data: { ...label, taskCount: 0 },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a label
   * PATCH /api/labels/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateLabelSchema.parse(req.body);
      const userId = req.user!.userId;

      const existing = await prisma.label.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'LABEL_NOT_FOUND', 'Etiqueta não encontrada');
      }

      // Check name uniqueness if changing name
      if (data.name && data.name.toLowerCase() !== existing.name) {
        const nameExists = await prisma.label.findUnique({
          where: { userId_name: { userId, name: data.name.toLowerCase() } },
        });

        if (nameExists) {
          throw new AppError(409, 'LABEL_EXISTS', 'Etiqueta já existe');
        }
      }

      const label = await prisma.label.update({
        where: { id },
        data: {
          name: data.name?.toLowerCase(),
          color: data.color,
        },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      });

      res.json({
        success: true,
        data: {
          ...label,
          taskCount: label._count.tasks,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a label
   * DELETE /api/labels/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.label.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'LABEL_NOT_FOUND', 'Etiqueta não encontrada');
      }

      await prisma.label.delete({ where: { id } });

      res.json({
        success: true,
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Merge two labels
   * POST /api/labels/:id/merge
   */
  static async merge(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { targetLabelId } = req.body;
      const userId = req.user!.userId;

      if (!targetLabelId) {
        throw new AppError(400, 'MISSING_TARGET', 'targetLabelId é obrigatório');
      }

      if (id === targetLabelId) {
        throw new AppError(400, 'SAME_LABEL', 'Não é possível mesclar a etiqueta consigo mesma');
      }

      // Verify both labels exist and belong to user
      const [sourceLabel, targetLabel] = await Promise.all([
        prisma.label.findFirst({ where: { id, userId } }),
        prisma.label.findFirst({ where: { id: targetLabelId, userId } }),
      ]);

      if (!sourceLabel) {
        throw new AppError(404, 'LABEL_NOT_FOUND', 'Etiqueta de origem não encontrada');
      }

      if (!targetLabel) {
        throw new AppError(404, 'TARGET_NOT_FOUND', 'Etiqueta de destino não encontrada');
      }

      // Get all tasks with source label
      const taskLabels = await prisma.taskLabel.findMany({
        where: { labelId: id },
      });

      // Move tasks to target label (avoiding duplicates)
      for (const tl of taskLabels) {
        const exists = await prisma.taskLabel.findUnique({
          where: {
            taskId_labelId: {
              taskId: tl.taskId,
              labelId: targetLabelId,
            },
          },
        });

        if (!exists) {
          await prisma.taskLabel.create({
            data: {
              taskId: tl.taskId,
              labelId: targetLabelId,
            },
          });
        }
      }

      // Delete source label (cascade will remove taskLabels)
      await prisma.label.delete({ where: { id } });

      res.json({
        success: true,
        data: {
          message: `Etiqueta "${sourceLabel.name}" mesclada com "${targetLabel.name}"`,
          mergedCount: taskLabels.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
