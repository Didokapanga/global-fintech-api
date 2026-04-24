import { Router } from 'express';
import {
  createTransfertClient,
  getTransfertClientByAgence,
  getTransfertClientByAgent,
  getTransfertsClientToValidate,
  getTransfertsClientToWithdraw
} from '../controllers/transfertClient.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransfertClient
 *   description: Gestion des transferts client (cash transfer)
 */

/**
 * @swagger
 * /api/transfert-client:
 *   post:
 *     summary: Créer un transfert client
 *     description: |
 *       Permet l’envoi d’argent avec enregistrement complet
 *       des informations expéditeur et destinataire.
 *
 *       🔐 Le user connecté est automatiquement injecté
 *
 *       🔑 Un code secret est généré automatiquement
 *       pour permettre le retrait sécurisé.
 *
 *       📅 `date_operation` représente la vraie date métier
 *       de l’opération (sans heure).
 *
 *       📌 Le transfert est créé automatiquement avec le statut :
 *       INITIE
 *
 *     tags: [TransfertClient]
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
 *               - caisse_id
 *               - agence_exp
 *               - agence_dest
 *               - montant
 *               - devise
 *               - date_operation
 *
 *               # EXPEDITEUR
 *               - exp_nom
 *               - exp_phone
 *               - exp_type_piece
 *               - exp_numero_piece
 *
 *               # DESTINATAIRE
 *               - dest_nom
 *               - dest_phone
 *               - dest_type_piece
 *               - dest_numero_piece
 *
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse utilisée
 *                 example: uuid-caisse
 *
 *               agence_exp:
 *                 type: string
 *                 description: ID de l’agence expéditrice
 *                 example: uuid-agence-exp
 *
 *               agence_dest:
 *                 type: string
 *                 description: ID de l’agence destinataire
 *                 example: uuid-agence-dest
 *
 *               exp_nom:
 *                 type: string
 *                 example: KABANGA
 *
 *               exp_postnom:
 *                 type: string
 *                 example: MUTOMBO
 *
 *               exp_prenom:
 *                 type: string
 *                 example: JEAN
 *
 *               exp_phone:
 *                 type: string
 *                 example: 0999999999
 *
 *               exp_type_piece:
 *                 type: string
 *                 example: PASSEPORT
 *
 *               exp_numero_piece:
 *                 type: string
 *                 example: AB123456
 *
 *               dest_nom:
 *                 type: string
 *                 example: MUKENDI
 *
 *               dest_postnom:
 *                 type: string
 *                 example: TSHIBALA
 *
 *               dest_prenom:
 *                 type: string
 *                 example: JOEL
 *
 *               dest_phone:
 *                 type: string
 *                 example: 0888888888
 *
 *               dest_type_piece:
 *                 type: string
 *                 example: CARTE_IDENTITE
 *
 *               dest_numero_piece:
 *                 type: string
 *                 example: CD987654
 *
 *               montant:
 *                 type: number
 *                 example: 500
 *
 *               frais:
 *                 type: number
 *                 example: 5
 *
 *               commission:
 *                 type: number
 *                 example: 2
 *
 *               devise:
 *                 type: string
 *                 example: USD
 *
 *               date_operation:
 *                 type: string
 *                 format: date
 *                 description: Date réelle de l’opération (YYYY-MM-DD)
 *                 example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Transfert créé avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Transfert créé avec succès
 *               data:
 *                 transfert:
 *                   id: uuid
 *                   statut: INITIE
 *                 code_secret: 123456
 *
 *       400:
 *         description: Erreur validation métier
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
  roleGuard(['CAISSIER']),
  createTransfertClient
);

/**
 * @swagger
 * /api/transfert-client/agence/{agence_id}:
 *   get:
 *     summary: Liste des transferts par agence
 *     description: |
 *       Retourne tous les transferts liés à une agence :
 *       - agence expéditrice
 *       - agence destinataire
 *
 *       📊 Support :
 *       - pagination
 *       - filtre par statut
 *       - filtre par date_operation
 *
 *     tags: [TransfertClient]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: agence_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l’agence
 *
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
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *         example: INITIE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date d’opération
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Liste des transferts récupérée
 */
router.get(
  '/agence/:agence_id',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2', 'CAISSIER']),
  getTransfertClientByAgence
);

/**
 * @swagger
 * /api/transfert-client/me:
 *   get:
 *     summary: Historique des transferts de l'utilisateur connecté
 *     description: |
 *       Retourne tous les transferts client créés par l'utilisateur connecté.
 *
 *       📊 Support :
 *       - pagination
 *       - filtre par statut
 *       - filtre par date_operation
 *
 *       📌 Statuts possibles :
 *       - INITIE
 *       - VALIDE
 *       - EXECUTE
 *       - REJETE
 *
 *     tags: [TransfertClient]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         example: INITIE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 */
router.get(
  '/me',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransfertClientByAgent
);

/**
 * @swagger
 * /api/transfert-client/validation:
 *   get:
 *     summary: Liste des transferts client à valider
 *     description: |
 *       Retourne les transferts au statut INITIE
 *       pour l’agence du user connecté.
 *
 *       📊 Support :
 *       - pagination
 *       - filtre par statut
 *       - filtre par date_operation
 *
 *     tags: [TransfertClient]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         example: INITIE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Liste des transferts à valider récupérée
 */
router.get(
  '/validation',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransfertsClientToValidate
);

/**
 * @swagger
 * /api/transfert-client/retrait:
 *   get:
 *     summary: Liste des transferts disponibles pour retrait
 *     description: |
 *       Retourne les transferts au statut VALIDE
 *       pour l’agence destinataire.
 *
 *       📊 Support :
 *       - pagination
 *       - filtre par statut
 *       - filtre par date_operation
 *
 *     tags: [TransfertClient]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         example: VALIDE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Liste des transferts disponibles pour retrait récupérée
 */
router.get(
  '/retrait',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransfertsClientToWithdraw
);

export default router;