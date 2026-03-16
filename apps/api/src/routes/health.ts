import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verifica o status da API e suas dependências
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API está saudável
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: API não está saudável
 */
router.get('/', HealthController.check);

/**
 * @swagger
 * /health/info:
 *   get:
 *     summary: System information
 *     description: Retorna informações detalhadas do sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Informações do sistema
 */
router.get('/info', HealthController.info);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check
 *     description: Verifica se a aplicação está pronta para receber tráfego (Kubernetes)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicação pronta
 *       503:
 *         description: Aplicação não está pronta
 */
router.get('/ready', HealthController.ready);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check
 *     description: Verifica se a aplicação está viva (Kubernetes)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicação está viva
 */
router.get('/live', HealthController.live);

export { router as healthRouter };
