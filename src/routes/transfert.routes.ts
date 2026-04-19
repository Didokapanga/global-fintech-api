import { Router } from 'express';
import { transfertCaisse } from '../controllers/transfert.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransfertCaisse
 *   description: Transfert entre caisses
 */

/**
 * @swagger
 * /api/transferts:
 *   post:
 *     summary: Transférer entre deux caisses
 *     tags: [TransfertCaisse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caisse_source_id
 *               - caisse_destination_id
 *               - montant
 *               - devise
 *             properties:
 *               caisse_source_id:
 *                 type: string
 *               caisse_destination_id:
 *                 type: string
 *               montant:
 *                 type: number
 *               devise:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfert réussi
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1']),
  transfertCaisse
);

export default router;