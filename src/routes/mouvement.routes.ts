import { Router } from 'express';
import { createMouvement } from '../controllers/mouvement.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mouvements
 *   description: Gestion des mouvements de caisse
 */

/**
 * @swagger
 * /api/mouvements:
 *   post:
 *     summary: Effectuer un mouvement de caisse
 *     description: Permet d’ajouter ou retirer de l’argent d’une caisse (opération sensible)
 *     tags: [Mouvements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caisse_id
 *               - montant
 *               - type_mouvement
 *               - devise
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 example: uuid-caisse
 *               montant:
 *                 type: number
 *                 example: 500
 *               type_mouvement:
 *                 type: string
 *                 enum:
 *                   - APPROVISIONNEMENT
 *                   - RETRAIT_SORTIE
 *                   - TRANSFERT_SORTIE
 *               devise:
 *                 type: string
 *                 example: USD
 *     responses:
 *       200:
 *         description: Mouvement effectué avec succès
 *       400:
 *         description: Erreur
 *       401:
 *         description: Non autorisé
 */

router.post(
  '/',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']), // 🔥 mieux sécurisé
  createMouvement
);

export default router;