import { Router } from 'express';
import { getTransferts, getTransfertsCaisseToProcess, transfertCaisse } from '../controllers/transfert.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransfertCaisse
 *   description: Gestion des transferts entre caisses
 */

/**
 * @swagger
 * /api/transferts:
 *   post:
 *     summary: Effectuer un transfert entre deux caisses
 *     description: |
 *       Permet de créer un transfert entre une caisse source et une caisse destination.
 *
 *       🔐 Sécurité métier :
 *       - la caisse source doit être ouverte
 *       - la caisse destination doit être ouverte
 *       - la caisse source doit avoir un solde suffisant
 *       - impossible de transférer vers la même caisse
 *
 *       📌 Le transfert est créé avec le statut :
 *       INITIE
 *
 *       📅 Le champ `date_operation` permet d’enregistrer
 *       la vraie date métier de l’opération.
 *
 *     tags: [TransfertCaisse]
 *     security:
 *       - bearerAuth: []
 *
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
 *               - date_operation
 *
 *             properties:
 *               caisse_source_id:
 *                 type: string
 *                 description: ID de la caisse émettrice
 *                 example: uuid-caisse-source
 *
 *               caisse_destination_id:
 *                 type: string
 *                 description: ID de la caisse destinataire
 *                 example: uuid-caisse-destination
 *
 *               montant:
 *                 type: number
 *                 description: Montant à transférer
 *                 example: 1500
 *
 *               devise:
 *                 type: string
 *                 description: Devise utilisée
 *                 example: USD
 *
 *               date_operation:
 *                 type: string
 *                 format: date-time
 *                 description: Date réelle de l'opération
 *                 example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Transfert effectué avec succès
 *
 *       400:
 *         description: Erreur métier ou validation
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
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
 *     summary: Liste des transferts caisse (historique)
 *     description: |
 *       Retourne les transferts selon le rôle :
 *
 *       🔴 ADMIN → tous les transferts
 *
 *       🟡 N+1 / N+2 → transferts de l’agence
 *
 *       🟢 CAISSIER → transferts liés à ses caisses
 *
 *       📊 Résultat paginé
 *
 *       🔍 Filtres disponibles :
 *       - devise
 *       - statut
 *       - date_operation
 *
 *     tags: [TransfertCaisse]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page
 *         example: 10
 *
 *       - in: query
 *         name: devise
 *         schema:
 *           type: string
 *         description: Filtrer par devise
 *         example: USD
 *
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [INITIE, VALIDE, EXECUTE, REJETE]
 *         description: Filtrer par statut
 *         example: VALIDE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date métier de l'opération
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Liste des transferts récupérée avec succès
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
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
 *       Retourne les transferts en attente de validation
 *       ou d’exécution.
 *
 *       📌 Statuts concernés :
 *       - INITIE
 *       - VALIDE
 *
 *       🔐 Filtré selon le rôle :
 *
 *       🔴 ADMIN → tout
 *
 *       🟡 N+1 / N+2 → agence
 *
 *       🟢 CAISSIER → ses caisses uniquement
 *
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
 *           type: integer
 *         description: Numéro de page
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Liste des transferts à traiter
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/process',
  authMiddleware,
  roleGuard(['ADMIN', 'CAISSIER', 'N+1', 'N+2']),
  getTransfertsCaisseToProcess
);

/**
 * @swagger
 * /api/transferts/{id}:
 *   get:
 *     summary: Détail d’un transfert caisse
 *     description: |
 *       Retourne le détail complet d’un transfert caisse
 *       à partir de son identifiant.
 *
 *     tags: [TransfertCaisse]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du transfert
 *
 *     responses:
 *       200:
 *         description: Transfert trouvé
 *
 *       404:
 *         description: Transfert introuvable
 *
 *       401:
 *         description: Non authentifié
 */
router.get(
  '/:id',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransferts
);

export default router;