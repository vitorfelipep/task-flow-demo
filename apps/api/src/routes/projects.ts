import { Router } from 'express';
import { ProjectsController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Listar projetos
 *     description: Retorna todos os projetos do usuário
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de projetos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', ProjectsController.findAll);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Obter projeto
 *     description: Retorna um projeto com suas tarefas
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeCompleted
 *         schema:
 *           type: boolean
 *         description: Incluir tarefas concluídas
 *     responses:
 *       200:
 *         description: Dados do projeto com tarefas
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', ProjectsController.findOne);

/**
 * @swagger
 * /api/projects/{id}/stats:
 *   get:
 *     summary: Estatísticas do projeto
 *     description: Retorna estatísticas e métricas do projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatísticas do projeto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     completed:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     overdue:
 *                       type: integer
 *                     completionRate:
 *                       type: integer
 *                     byPriority:
 *                       type: object
 */
router.get('/:id/stats', ProjectsController.getStats);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Criar projeto
 *     description: Cria um novo projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProject'
 *           example:
 *             name: "Novo Projeto"
 *             color: "#4A90A4"
 *     responses:
 *       201:
 *         description: Projeto criado
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Projeto já existe
 */
router.post('/', ProjectsController.create);

/**
 * @swagger
 * /api/projects/reorder:
 *   post:
 *     summary: Reordenar projetos
 *     description: Define a ordem dos projetos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectIds
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs dos projetos na ordem desejada
 *     responses:
 *       200:
 *         description: Projetos reordenados
 */
router.post('/reorder', ProjectsController.reorder);

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Atualizar projeto
 *     description: Atualiza um projeto existente
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Projeto atualizado
 *       400:
 *         description: Inbox não pode ser editado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', ProjectsController.update);

/**
 * @swagger
 * /api/projects/{id}/archive:
 *   post:
 *     summary: Arquivar projeto
 *     description: Arquiva um projeto e marca todas as tarefas como concluídas
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projeto arquivado
 *       400:
 *         description: Inbox não pode ser arquivado
 */
router.post('/:id/archive', ProjectsController.archive);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Excluir projeto
 *     description: Remove um projeto. As tarefas são movidas para o Inbox ou outro projeto especificado.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: moveTasksTo
 *         schema:
 *           type: string
 *         description: ID do projeto para mover as tarefas (padrão Inbox)
 *     responses:
 *       200:
 *         description: Projeto excluído
 *       400:
 *         description: Inbox não pode ser excluído
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', ProjectsController.delete);

export { router as projectsRouter };
