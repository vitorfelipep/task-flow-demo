import type { Request, Response } from 'express';
import { prisma } from '@taskflow/database';

/**
 * Health Controller
 * Handles health check and system status endpoints
 */
export class HealthController {
  /**
   * Basic health check
   * GET /health
   */
  static async check(_req: Request, res: Response) {
    const startTime = Date.now();

    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;

      const dbLatency = Date.now() - startTime;

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {
          database: {
            status: 'healthy',
            latency: `${dbLatency}ms`,
          },
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: {
          database: {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    }
  }

  /**
   * Detailed system information
   * GET /health/info
   */
  static async info(_req: Request, res: Response) {
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        uptime: process.uptime(),
        pid: process.pid,
      },
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  }

  /**
   * Readiness check (for Kubernetes/Docker)
   * GET /health/ready
   */
  static async ready(_req: Request, res: Response) {
    try {
      // Check if database is ready
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        ready: true,
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        ready: false,
        timestamp: new Date().toISOString(),
        message: 'Database not ready',
      });
    }
  }

  /**
   * Liveness check (for Kubernetes/Docker)
   * GET /health/live
   */
  static async live(_req: Request, res: Response) {
    res.json({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  }
}
