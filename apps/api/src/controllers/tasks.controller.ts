import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@taskflow/database';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema } from '@taskflow/shared';
import { AppError } from '../middlewares/error-handler';

/**
 * Tasks Controller
 * Handles all task-related operations
 */
export class TasksController {
  /**
   * Get all tasks with filters
   * GET /api/tasks
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = taskFiltersSchema.parse(req.query);
      const userId = req.user!.userId;

      const where: Record<string, unknown> = { userId };

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.projectId) {
        where.projectId = filters.projectId;
      }

      if (filters.labelId) {
        where.labels = {
          some: { labelId: filters.labelId },
        };
      }

      if (filters.dueDateFrom || filters.dueDateTo) {
        where.dueDate = {};
        if (filters.dueDateFrom) {
          (where.dueDate as Record<string, Date>).gte = new Date(filters.dueDateFrom);
        }
        if (filters.dueDateTo) {
          (where.dueDate as Record<string, Date>).lte = new Date(filters.dueDateTo);
        }
      }

      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          project: true,
          labels: {
            include: { label: true },
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'asc' },
          { order: 'asc' },
        ],
      });

      // Transform labels
      const transformedTasks = tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
      }));

      res.json({
        success: true,
        data: transformedTasks,
        meta: { total: tasks.length },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single task by ID
   * GET /api/tasks/:id
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const task = await prisma.task.findFirst({
        where: { id, userId },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
      });

      if (!task) {
        throw new AppError(404, 'TASK_NOT_FOUND', 'Tarefa não encontrada');
      }

      res.json({
        success: true,
        data: {
          ...task,
          labels: task.labels.map((tl) => tl.label),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tasks for today
   * GET /api/tasks/today
   */
  static async findToday(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
        orderBy: [{ priority: 'asc' }, { dueTime: 'asc' }, { order: 'asc' }],
      });

      const transformedTasks = tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
      }));

      res.json({
        success: true,
        data: transformedTasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming tasks (next 7 days)
   * GET /api/tasks/upcoming
   */
  static async findUpcoming(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            gte: today,
            lte: nextWeek,
          },
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }, { order: 'asc' }],
      });

      const transformedTasks = tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
      }));

      res.json({
        success: true,
        data: transformedTasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overdue tasks
   * GET /api/tasks/overdue
   */
  static async findOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          status: 'pending',
          dueDate: {
            lt: today,
          },
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
        orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
      });

      const transformedTasks = tasks.map((task) => ({
        ...task,
        labels: task.labels.map((tl) => tl.label),
      }));

      res.json({
        success: true,
        data: transformedTasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new task
   * POST /api/tasks
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const userId = req.user!.userId;

      // Get default inbox if no project specified
      let projectId = data.projectId;
      if (!projectId) {
        const inbox = await prisma.project.findFirst({
          where: { userId, isInbox: true },
        });
        if (!inbox) {
          throw new AppError(400, 'NO_INBOX', 'Inbox não encontrado');
        }
        projectId = inbox.id;
      }

      // Verify project belongs to user
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });

      if (!project) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      // Get max order
      const maxOrder = await prisma.task.aggregate({
        where: { userId, projectId },
        _max: { order: true },
      });

      const task = await prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority || 'P4',
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          dueTime: data.dueTime,
          order: (maxOrder._max.order || 0) + 1,
          userId,
          projectId,
          labels: data.labelIds
            ? { create: data.labelIds.map((labelId) => ({ labelId })) }
            : undefined,
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          ...task,
          labels: task.labels.map((tl) => tl.label),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a task
   * PATCH /api/tasks/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateTaskSchema.parse(req.body);
      const userId = req.user!.userId;

      // Check task exists and belongs to user
      const existing = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'TASK_NOT_FOUND', 'Tarefa não encontrada');
      }

      // Verify new project if provided
      if (data.projectId) {
        const project = await prisma.project.findFirst({
          where: { id: data.projectId, userId },
        });
        if (!project) {
          throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
        }
      }

      // Handle label updates
      if (data.labelIds !== undefined) {
        await prisma.taskLabel.deleteMany({ where: { taskId: id } });
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          dueTime: data.dueTime,
          order: data.order,
          projectId: data.projectId,
          completedAt: data.status === 'completed' ? new Date() : 
                       data.status === 'pending' ? null : undefined,
          labels: data.labelIds
            ? { create: data.labelIds.map((labelId) => ({ labelId })) }
            : undefined,
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
      });

      res.json({
        success: true,
        data: {
          ...task,
          labels: task.labels.map((tl) => tl.label),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle task completion status
   * POST /api/tasks/:id/toggle
   */
  static async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'TASK_NOT_FOUND', 'Tarefa não encontrada');
      }

      const newStatus = existing.status === 'completed' ? 'pending' : 'completed';

      const task = await prisma.task.update({
        where: { id },
        data: {
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date() : null,
        },
        include: {
          project: true,
          labels: { include: { label: true } },
        },
      });

      res.json({
        success: true,
        data: {
          ...task,
          labels: task.labels.map((tl) => tl.label),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a task
   * DELETE /api/tasks/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.task.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'TASK_NOT_FOUND', 'Tarefa não encontrada');
      }

      await prisma.task.delete({ where: { id } });

      res.json({
        success: true,
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update tasks (reorder, move to project, etc.)
   * PATCH /api/tasks/bulk
   */
  static async bulkUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskIds, updates } = req.body;
      const userId = req.user!.userId;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        throw new AppError(400, 'INVALID_INPUT', 'taskIds deve ser um array não vazio');
      }

      // Verify all tasks belong to user
      const tasks = await prisma.task.findMany({
        where: { id: { in: taskIds }, userId },
      });

      if (tasks.length !== taskIds.length) {
        throw new AppError(404, 'TASKS_NOT_FOUND', 'Uma ou mais tarefas não foram encontradas');
      }

      await prisma.task.updateMany({
        where: { id: { in: taskIds }, userId },
        data: {
          ...(updates.projectId && { projectId: updates.projectId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.priority && { priority: updates.priority }),
        },
      });

      res.json({
        success: true,
        data: { updatedCount: tasks.length },
      });
    } catch (error) {
      next(error);
    }
  }
}
