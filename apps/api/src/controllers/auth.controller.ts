import type { Request, Response, NextFunction } from 'express';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@taskflow/database';
import { loginSchema, signupSchema } from '@taskflow/shared';
import { AppError } from '../middlewares/error-handler';
import { generateToken } from '../middlewares/auth';

/**
 * Auth Controller
 * Handles user authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/signup
   */
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = signupSchema.parse(req.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError(409, 'USER_EXISTS', 'Email já cadastrado');
      }

      // Hash password
      const hashedPassword = await hash(data.password, 12);

      // Create user with default inbox project
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
          projects: {
            create: {
              name: 'Inbox',
              color: '#808080',
              isInbox: true,
              order: 0,
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      });

      // Generate token
      const accessToken = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user,
          accessToken,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos');
      }

      // Check password
      const isValidPassword = await compare(data.password, user.password);

      if (!isValidPassword) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Email ou senha inválidos');
      }

      // Generate token
      const accessToken = generateToken({ userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
          },
          accessToken,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PATCH /api/auth/me
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, avatarUrl } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: {
          ...(name && { name }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * POST /api/auth/change-password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError(400, 'MISSING_FIELDS', 'Senha atual e nova senha são obrigatórias');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
      });

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado');
      }

      // Verify current password
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'INVALID_PASSWORD', 'Senha atual incorreta');
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 12);

      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { password: hashedPassword },
      });

      res.json({
        success: true,
        data: { message: 'Senha alterada com sucesso' },
      });
    } catch (error) {
      next(error);
    }
  }
}
