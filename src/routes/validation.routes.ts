import { Router } from 'express';
import { validateOperation } from '../controllers/validation.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Validation
 *   description: Validation des opérations (N+1 / N+2)
 */

/**
 * @swagger
 * /api/validations:
 *   post:
 *     summary: Valider ou rejeter une opération
 *     tags: [Validation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - operation_type
 *               - reference_id
 *               - decision
 *               - niveau
 *               - validated_by
 *             properties:
 *               operation_type:
 *                 type: string
 *                 example: TRANSFERT_CLIENT
 *               reference_id:
 *                 type: string
 *                 example: uuid-operation
 *               decision:
 *                 type: string
 *                 example: APPROUVE
 *               niveau:
 *                 type: string
 *                 example: N1
 *               validated_by:
 *                 type: string
 *                 example: uuid-user
 *               commentaire:
 *                 type: string
 *                 example: Validation OK
 *     responses:
 *       200:
 *         description: Validation effectuée
 *       400:
 *         description: Erreur
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['N+1', 'N+2', 'CAISSIER', 'ADMIN']),
  validateOperation
);

export default router;