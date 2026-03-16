import { Router } from 'express';
import { LabelsController } from '../controllers';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/labels:
 *   get:
 *     summary: Listar etiquetas
 *     description: Retorna todas as etiquetas do usuário
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de etiquetas
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
 *                     $ref: '#/components/schemas/Label'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', LabelsController.findAll);

/**
 * @swagger
 * /api/labels/{id}:
 *   get:
 *     summary: Obter etiqueta
 *     description: Retorna uma etiqueta com suas tarefas
 *     tags: [Labels]
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
 *         description: Dados da etiqueta com tarefas
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', LabelsController.findOne);

/**
 * @swagger
 * /api/labels:
 *   post:
 *     summary: Criar etiqueta
 *     description: Cria uma nova etiqueta
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLabel'
 *           example:
 *             name: "urgente"
 *             color: "#FF6B6B"
 *     responses:
 *       201:
 *         description: Etiqueta criada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Label'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Etiqueta já existe
 */
router.post('/', LabelsController.create);

/**
 * @swagger
 * /api/labels/{id}:
 *   patch:
 *     summary: Atualizar etiqueta
 *     description: Atualiza uma etiqueta existente
 *     tags: [Labels]
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
 *                 pattern: ^#[0-9A-Fa-f]{6}$
 *     responses:
 *       200:
 *         description: Etiqueta atualizada
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Nome já existe
 */
router.patch('/:id', LabelsController.update);

/**
 * @swagger
 * /api/labels/{id}/merge:
 *   post:
 *     summary: Mesclar etiquetas
 *     description: Mescla uma etiqueta com outra, movendo todas as tarefas
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da etiqueta a ser removida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetLabelId
 *             properties:
 *               targetLabelId:
 *                 type: string
 *                 description: ID da etiqueta de destino
 *     responses:
 *       200:
 *         description: Etiquetas mescladas
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
 *                     message:
 *                       type: string
 *                     mergedCount:
 *                       type: integer
 *       400:
 *         description: Não é possível mesclar consigo mesma
 *       404:
 *         description: Etiqueta não encontrada
 */
router.post('/:id/merge', LabelsController.merge);

/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     summary: Excluir etiqueta
 *     description: Remove uma etiqueta permanentemente
 *     tags: [Labels]
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
 *         description: Etiqueta excluída
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', LabelsController.delete);

export { router as labelsRouter };
