import { Router } from 'express';
import { createTransfertClient, getTransfertClientByAgence, getTransfertClientByAgent, getTransfertsClientToValidate, getTransfertsClientToWithdraw } from '../controllers/transfertClient.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TransfertClient
 *   description: Gestion des transferts client (envoi d'argent)
 */

/**
 * @swagger
 * /api/transfert-client:
 *   post:
 *     summary: Créer un transfert client
 *     description: Permet d’envoyer de l’argent d’un client à un autre avec génération d’un code secret
 *     tags: [TransfertClient]
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
 *               - client_exp
 *               - client_dest
 *               - montant
 *               - devise
 *               - created_by
 *               - type_piece
 *               - numero_piece
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 example: uuid-caisse
 *               agence_exp:
 *                 type: string
 *                 example: uuid-agence-exp
 *               agence_dest:
 *                 type: string
 *                 example: uuid-agence-dest
 *               client_exp:
 *                 type: string
 *                 example: uuid-client-exp
 *               client_dest:
 *                 type: string
 *                 example: uuid-client-dest
 *               type_piece:
 *                 type: string
 *                 description: Type de pièce d'identité du bénéficiaire
 *                 example: CNI
 *               numero_piece:
 *                 type: string
 *                 description: Numéro de pièce d'identité
 *                 example: AB123456
 *               montant:
 *                 type: number
 *                 example: 500
 *               frais:
 *                 type: number
 *                 description: Frais appliqués au transfert
 *                 example: 5
 *               commission:
 *                 type: number
 *                 description: Commission interne
 *                 example: 2
 *               devise:
 *                 type: string
 *                 example: USD
 *               created_by:
 *                 type: string
 *                 description: ID de l'utilisateur initiateur
 *                 example: uuid-user
 *     responses:
 *       200:
 *         description: Transfert créé avec succès (code secret généré)
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Transfert créé avec succès
 *               data:
 *                 transfert:
 *                   id: uuid
 *                   montant: 500
 *                   devise: USD
 *                   statut: INITIE
 *                 code_secret: 123456
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Montant invalide
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN']),
  createTransfertClient
);

/**
 * @swagger
 * /api/transfert-client/agence/{agence_id}:
 *   get:
 *     summary: Liste des transferts client par agence
 *     tags: [TransfertClient]
 *     parameters:
 *       - in: path
 *         name: agence_id
 *         required: true
 *         schema:
 *           type: string
 *         example: uuid-agence
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
 *         description: Liste des transferts de l’agence
 */
router.get(
  '/agence/:agence_id',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  getTransfertClientByAgence
);

/**
 * @swagger
 * /api/transfert-client/me:
 *   get:
 *     summary: Liste des transferts du caissier connecté
 *     tags: [TransfertClient]
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
 *         description: Liste des transferts de l'utilisateur
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
 *     summary: Liste des transferts à valider (statut INITIE)
 *     description: |
 *       Retourne les transferts clients en attente de validation.
 *
 *       🔐 Basé sur l’agence du user connecté
 *       📊 Pagination incluse
 *
 *     tags: [TransfertClient]
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
 *         description: Liste des transferts INITIE
 *       401:
 *         description: Non authentifié
 */

router.get(
  '/validation',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  getTransfertsClientToValidate
);

/**
 * @swagger
 * /api/transfert-client/retrait:
 *   get:
 *     summary: Transferts disponibles pour retrait (VALIDE)
 *     description: |
 *       Retourne les transferts clients VALIDÉS,
 *       disponibles pour retrait dans l’agence destination.
 *
 *       🔐 Filtré par agence du user connecté
 *
 *     tags: [TransfertClient]
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
 *         description: Liste des transferts prêts pour retrait
 */

router.get(
  '/retrait',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getTransfertsClientToWithdraw
);

export default router;