import { Router } from 'express';
import { getTransferts, getTransfertsCaisseToProcess, transfertCaisse } from '../controllers/transfert.controller.js';
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

/**
 * @swagger
 * /api/transferts:
 *   get:
 *     summary: Liste des transferts (paginé)
 *     tags: [TransfertCaisse]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         example: 10
 *     responses:
 *       200:
 *         description: Liste des transferts
 */
router.get(
  '/',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransferts
);

/**
 * @swagger
 * /api/transferts/process:
 *   get:
 *     summary: Transferts caisse à traiter (INITIE + VALIDE)
 *     description: |
 *       Retourne les transferts de caisse en attente de validation ou exécution.
 *
 *       🔐 Filtré par agence du user connecté
 *       📊 Pagination incluse
 *
 *     tags: [TransfertCaisse]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           example: 10
 *
 *     responses:
 *       200:
 *         description: Liste des transferts à traiter
 */

router.get(
  '/process',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  getTransfertsCaisseToProcess
);

/**
 * @swagger
 * /api/transferts/{id}:
 *   get:
 *     summary: Détail d’un transfert
 *     tags: [TransfertCaisse]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transfert trouvé
 *       404:
 *         description: Transfert introuvable
 */
router.get(
  '/:id',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransferts
);

export default router;