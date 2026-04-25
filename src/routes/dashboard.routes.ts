import { Router } from 'express';
import {
  getDashboardOverview
} from '../controllers/dashboard.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Tableau de bord financier global
 */

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Vue globale des indicateurs financiers
 *     description: |
 *       Permet d’obtenir une vue consolidée
 *       des principaux indicateurs financiers.
 *
 *       📊 Indicateurs retournés :
 *
 *       1. Transfert client
 *       - volume total (montant cumulé)
 *       - nombre total
 *
 *       2. Retrait
 *       - volume total (montant cumulé)
 *       - nombre total
 *
 *       3. Transferts en attente de validation
 *       - uniquement statut = INITIE
 *       - volume total
 *       - nombre total
 *
 *       4. Retraits en attente de validation
 *       - uniquement statut = INITIE
 *       - volume total
 *       - nombre total
 *
 *       📅 Filtrage possible par :
 *       - date_operation
 *
 *       🔐 Accessible à :
 *       - ADMIN
 *       - N+1
 *       - N+2
 *
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: date_operation
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: 2026-04-24
 *         description: |
 *           Filtrer les statistiques
 *           sur une date métier précise
 *           (format YYYY-MM-DD)
 *
 *     responses:
 *       200:
 *         description: Dashboard récupéré avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Dashboard récupéré avec succès
 *               data:
 *                 transfert_client:
 *                   total_volume: 15000
 *                   total_count: 23
 *
 *                 retrait:
 *                   total_volume: 8200
 *                   total_count: 11
 *
 *                 transfert_en_attente_validation:
 *                   total_volume: 5400
 *                   total_count: 7
 *
 *                 retrait_en_attente_validation:
 *                   total_volume: 3200
 *                   total_count: 4
 *
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Format date_operation invalide (YYYY-MM-DD attendu)
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/overview',
  authMiddleware,
  roleGuard([
    'ADMIN',
    'N+1',
    'N+2'
  ]),
  getDashboardOverview
);

export default router;