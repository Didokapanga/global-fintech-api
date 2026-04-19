import { Router } from 'express';
import { validateCloture } from '../controllers/clotureValidation.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ClotureValidation
 *   description: Validation des clôtures de caisse
 */

/**
 * @swagger
 * /api/clotures/validate:
 *   post:
 *     summary: Valider ou rejeter une clôture
 *     tags: [ClotureValidation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cloture_id
 *               - decision
 *               - validated_by
 *             properties:
 *               cloture_id:
 *                 type: string
 *                 example: uuid-cloture
 *               decision:
 *                 type: string
 *                 example: APPROUVE
 *               validated_by:
 *                 type: string
 *                 example: uuid-superviseur
 *     responses:
 *       200:
 *         description: Clôture validée
 *       400:
 *         description: Erreur
 */
router.post(
  '/validate',
  authMiddleware,
  roleGuard(['N+1', 'ADMIN']),
  validateCloture
);

export default router;