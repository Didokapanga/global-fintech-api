import { Router } from 'express';
import { getLedger, getMyLedgerController } from '../controllers/ledger.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Ledger
 *   description: Journal des opérations financières (audit)
 */

/**
 * @swagger
 * /api/ledger/me:
 *   get:
 *     summary: Historique ledger de l'utilisateur connecté
 *     description: Retourne les opérations selon le rôle (caisse agent, agence ou global)
 *     tags: [Ledger]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: type_operation
 *         schema:
 *           type: string
 *         description: "Filtrer par type d'opération (ex: TRANSFERT_CAISSE, RETRAIT)"
 *
 *       - in: query
 *         name: sens
 *         schema:
 *           type: string
 *           enum: [ENTREE, SORTIE]
 *         description: Filtrer par sens de l'opération
 *
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début (ISO)
 *
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin (ISO)
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page (défaut 1)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page (max 100)
 *
 *     responses:
 *       200:
 *         description: Ledger récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/me',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getMyLedgerController
);

/**
 * @swagger
 * /api/ledger/{caisse_id}:
 *   get:
 *     summary: Historique des opérations d'une caisse (ledger)
 *     description: Retourne toutes les opérations financières (ENTREE / SORTIE) associées à une caisse donnée avec filtres avancés
 *     tags: [Ledger]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: caisse_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la caisse
 *
 *       - in: query
 *         name: type_operation
 *         schema:
 *           type: string
 *         description: "Filtrer par type d'opération"
 *
 *       - in: query
 *         name: sens
 *         schema:
 *           type: string
 *           enum: [ENTREE, SORTIE]
 *         description: Filtrer par sens (entrée ou sortie)
 *
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de début
 *
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Date de fin
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page (défaut 1)
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page (max 100)
 *
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: []
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 100
 *
 *       400:
 *         description: Erreur requête
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/:caisse_id',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getLedger
);

export default router;