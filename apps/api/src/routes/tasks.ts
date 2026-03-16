import { Router } from 'express';
import { TasksController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Listar tarefas
 *     description: Retorna todas as tarefas do usuário com filtros opcionais
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
 *         description: Filtrar por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [P1, P2, P3, P4]
 *         description: Filtrar por prioridade
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filtrar por projeto
 *       - in: query
 *         name: labelId
 *         schema:
 *           type: string
 *         description: Filtrar por etiqueta
 *       - in: query
 *         name: dueDateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: dueDateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca no título e descrição
 *     responses:
 *       200:
 *         description: Lista de tarefas
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
 *                     $ref: '#/components/schemas/Task'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', TasksController.findAll);

/**
 * @swagger
 * /api/tasks/today:
 *   get:
 *     summary: Tarefas de hoje
 *     description: Retorna as tarefas pendentes para o dia atual
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tarefas de hoje
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
 *                     $ref: '#/components/schemas/Task'
 */
router.get('/today', TasksController.findToday);

/**
 * @swagger
 * /api/tasks/upcoming:
 *   get:
 *     summary: Próximas tarefas
 *     description: Retorna as tarefas pendentes dos próximos 7 dias
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Próximas tarefas
 */
router.get('/upcoming', TasksController.findUpcoming);

/**
 * @swagger
 * /api/tasks/overdue:
 *   get:
 *     summary: Tarefas atrasadas
 *     description: Retorna as tarefas pendentes com data de vencimento passada
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tarefas atrasadas
 */
router.get('/overdue', TasksController.findOverdue);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obter tarefa
 *     description: Retorna uma tarefa específica por ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Dados da tarefa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', TasksController.findOne);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Criar tarefa
 *     description: Cria uma nova tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTask'
 *           example:
 *             title: "Revisar relatório mensal"
 *             description: "Verificar os números do Q4"
 *             priority: "P1"
 *             dueDate: "2024-12-31"
 *             dueTime: "14:00"
 *     responses:
 *       201:
 *         description: Tarefa criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/', TasksController.create);

/**
 * @swagger
 * /api/tasks/bulk:
 *   patch:
 *     summary: Atualizar múltiplas tarefas
 *     description: Atualiza várias tarefas de uma vez (mover, alterar status, etc.)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - updates
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updates:
 *                 type: object
 *                 properties:
 *                   projectId:
 *                     type: string
 *                   status:
 *                     type: string
 *                   priority:
 *                     type: string
 *     responses:
 *       200:
 *         description: Tarefas atualizadas
 */
router.patch('/bulk', TasksController.bulkUpdate);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     summary: Atualizar tarefa
 *     description: Atualiza uma tarefa existente
 *     tags: [Tasks]
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
 *             $ref: '#/components/schemas/UpdateTask'
 *     responses:
 *       200:
 *         description: Tarefa atualizada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', TasksController.update);

/**
 * @swagger
 * /api/tasks/{id}/toggle:
 *   post:
 *     summary: Alternar status
 *     description: Alterna entre pendente e concluída
 *     tags: [Tasks]
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
 *         description: Status alterado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/:id/toggle', TasksController.toggle);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Excluir tarefa
 *     description: Remove uma tarefa permanentemente
 *     tags: [Tasks]
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
 *         description: Tarefa excluída
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
 *                     id:
 *                       type: string
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', TasksController.delete);

export { router as tasksRouter };
