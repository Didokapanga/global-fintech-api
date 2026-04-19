import { Router } from 'express';
import { createTransfertClient } from '../controllers/transfertClient.controller.js';
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

export default router;