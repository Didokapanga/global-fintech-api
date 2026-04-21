import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

import {
  createMouvement,
  getAllMouvements,
  getMouvementsByAgence
} from '../controllers/mouvement.controller.js';

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

/**
 * @swagger
 * /api/mouvements:
 *   get:
 *     summary: Récupérer tous les mouvements (ADMIN uniquement)
 *     description: |
 *       Retourne la liste paginée de tous les mouvements de caisse.
 *
 *       🔐 Accès réservé aux administrateurs uniquement.
 *
 *       📊 Fonctionnalités :
 *       - Pagination
 *       - Tri par date décroissante (les plus récents en premier)
 *
 *     tags: [Mouvements]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numéro de page
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d’éléments par page
 *
 *     responses:
 *       200:
 *         description: Liste paginée des mouvements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 120
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 12
 *
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit (réservé ADMIN)
 */

// 🔥 ADMIN ONLY
router.get(
  '/',
  authMiddleware,
  roleGuard(['ADMIN']),
  getAllMouvements
);

/**
 * @swagger
 * /api/mouvements/agence:
 *   get:
 *     summary: Récupérer les mouvements de son agence
 *     description: |
 *       Retourne les mouvements liés à l’agence du user connecté.
 *
 *       🔐 Sécurité :
 *       - Basé sur le JWT (agence automatique)
 *
 *       📊 Support :
 *       - Pagination
 *
 *     tags: [Mouvements]
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
 *         description: Liste paginée des mouvements
 *       401:
 *         description: Non authentifié
 */

// 🔥 USER → SON AGENCE
router.get(
  '/agence',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  getMouvementsByAgence
);

export default router;