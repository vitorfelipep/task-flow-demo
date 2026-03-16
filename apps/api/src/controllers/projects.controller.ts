import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@taskflow/database';
import { createProjectSchema, updateProjectSchema } from '@taskflow/shared';
import { AppError } from '../middlewares/error-handler';

/**
 * Projects Controller
 * Handles all project-related operations
 */
export class ProjectsController {
  /**
   * Get all projects for the current user
   * GET /api/projects
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const projects = await prisma.project.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              tasks: {
                where: { status: 'pending' },
              },
            },
          },
        },
        orderBy: [{ isInbox: 'desc' }, { order: 'asc' }],
      });

      const projectsWithCount = projects.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isInbox: p.isInbox,
        order: p.order,
        taskCount: p._count.tasks,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));

      res.json({
        success: true,
        data: projectsWithCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single project by ID with its tasks
   * GET /api/projects/:id
   */
  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const includeCompleted = req.query.includeCompleted === 'true';

      const project = await prisma.project.findFirst({
        where: { id, userId },
        include: {
          tasks: {
            where: includeCompleted ? {} : { status: 'pending' },
            include: {
              labels: { include: { label: true } },
            },
            orderBy: [{ status: 'asc' }, { priority: 'asc' }, { order: 'asc' }],
          },
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

      if (!project) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      const transformedProject = {
        ...project,
        taskCount: project._count.tasks,
        tasks: project.tasks.map((task) => ({
          ...task,
          labels: task.labels.map((tl) => tl.label),
        })),
      };

      res.json({
        success: true,
        data: transformedProject,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project statistics
   * GET /api/projects/:id/stats
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const project = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!project) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      const [total, completed, pending, overdue] = await Promise.all([
        prisma.task.count({ where: { projectId: id } }),
        prisma.task.count({ where: { projectId: id, status: 'completed' } }),
        prisma.task.count({ where: { projectId: id, status: 'pending' } }),
        prisma.task.count({
          where: {
            projectId: id,
            status: 'pending',
            dueDate: { lt: new Date() },
          },
        }),
      ]);

      const byPriority = await prisma.task.groupBy({
        by: ['priority'],
        where: { projectId: id, status: 'pending' },
        _count: { priority: true },
      });

      res.json({
        success: true,
        data: {
          total,
          completed,
          pending,
          overdue,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          byPriority: byPriority.reduce((acc, item) => {
            acc[item.priority] = item._count.priority;
            return acc;
          }, {} as Record<string, number>),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProjectSchema.parse(req.body);
      const userId = req.user!.userId;

      // Check for duplicate name
      const existingProject = await prisma.project.findFirst({
        where: { userId, name: data.name },
      });

      if (existingProject) {
        throw new AppError(409, 'PROJECT_EXISTS', 'Já existe um projeto com este nome');
      }

      // Get max order
      const maxOrder = await prisma.project.aggregate({
        where: { userId },
        _max: { order: true },
      });

      const project = await prisma.project.create({
        data: {
          name: data.name,
          color: data.color,
          order: (maxOrder._max.order || 0) + 1,
          userId,
        },
      });

      res.status(201).json({
        success: true,
        data: { ...project, taskCount: 0 },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a project
   * PATCH /api/projects/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateProjectSchema.parse(req.body);
      const userId = req.user!.userId;

      // Check project exists and belongs to user
      const existing = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      if (existing.isInbox && (data.name || data.color)) {
        throw new AppError(400, 'CANNOT_EDIT_INBOX', 'Inbox não pode ser editado');
      }

      // Check for duplicate name
      if (data.name && data.name !== existing.name) {
        const duplicateName = await prisma.project.findFirst({
          where: { userId, name: data.name, NOT: { id } },
        });

        if (duplicateName) {
          throw new AppError(409, 'PROJECT_EXISTS', 'Já existe um projeto com este nome');
        }
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          color: data.color,
          order: data.order,
        },
        include: {
          _count: {
            select: { tasks: { where: { status: 'pending' } } },
          },
        },
      });

      res.json({
        success: true,
        data: {
          ...project,
          taskCount: project._count.tasks,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder projects
   * POST /api/projects/reorder
   */
  static async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectIds } = req.body;
      const userId = req.user!.userId;

      if (!Array.isArray(projectIds)) {
        throw new AppError(400, 'INVALID_INPUT', 'projectIds deve ser um array');
      }

      // Verify all projects belong to user
      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds }, userId },
      });

      if (projects.length !== projectIds.length) {
        throw new AppError(404, 'PROJECTS_NOT_FOUND', 'Um ou mais projetos não foram encontrados');
      }

      // Update order for each project
      await Promise.all(
        projectIds.map((projectId, index) =>
          prisma.project.update({
            where: { id: projectId },
            data: { order: index + 1 },
          })
        )
      );

      res.json({
        success: true,
        data: { message: 'Projetos reordenados com sucesso' },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const moveTasksTo = req.query.moveTasksTo as string | undefined;

      const existing = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      if (existing.isInbox) {
        throw new AppError(400, 'CANNOT_DELETE_INBOX', 'Inbox não pode ser excluído');
      }

      // Get inbox for moving tasks
      const inbox = await prisma.project.findFirst({
        where: { userId, isInbox: true },
      });

      const targetProjectId = moveTasksTo || inbox?.id;

      if (targetProjectId) {
        // Move tasks to target project
        await prisma.task.updateMany({
          where: { projectId: id },
          data: { projectId: targetProjectId },
        });
      }

      await prisma.project.delete({ where: { id } });

      res.json({
        success: true,
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Archive a project (soft delete)
   * POST /api/projects/:id/archive
   */
  static async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const existing = await prisma.project.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        throw new AppError(404, 'PROJECT_NOT_FOUND', 'Projeto não encontrado');
      }

      if (existing.isInbox) {
        throw new AppError(400, 'CANNOT_ARCHIVE_INBOX', 'Inbox não pode ser arquivado');
      }

      // For now, we'll just mark tasks as completed
      // In a full implementation, you'd add an 'archived' field
      await prisma.task.updateMany({
        where: { projectId: id, status: 'pending' },
        data: { status: 'completed', completedAt: new Date() },
      });

      res.json({
        success: true,
        data: { message: 'Projeto arquivado com sucesso' },
      });
    } catch (error) {
      next(error);
    }
  }
}
