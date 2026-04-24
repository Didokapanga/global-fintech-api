import { Router } from 'express';
import {
  retrait,
  getMyRetraits
} from '../controllers/retrait.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Retrait
 *   description: Gestion des retraits (cash-out sécurisé avec KYC)
 */

/**
 * @swagger
 * /api/retraits:
 *   post:
 *     summary: Effectuer un retrait sécurisé
 *     description: |
 *       Permet de retirer un transfert client validé.
 *
 *       🔐 Sécurité multi-niveaux :
 *       - Vérification du code secret
 *       - Vérification du numéro de pièce du destinataire (KYC)
 *       - Vérification de l'agence de destination
 *       - Vérification que la caisse appartient à l'utilisateur connecté
 *       - Vérification que la caisse est ouverte
 *       - Vérification du solde disponible
 *
 *       ⚠️ Le retrait n'est possible que si le transfert est au statut :
 *       VALIDE
 *
 *       📅 `date_operation` représente la vraie date métier
 *       du retrait (sans heure).
 *
 *       📌 Le retrait passe automatiquement au statut :
 *       EXECUTE
 *
 *     tags: [Retrait]
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
 *               - code_reference
 *               - code_secret
 *               - caisse_id
 *               - numero_piece
 *               - date_operation
 *
 *             properties:
 *               code_reference:
 *                 type: string
 *                 description: Code de référence du transfert
 *                 example: REF17123456789
 *
 *               code_secret:
 *                 type: string
 *                 description: Code secret fourni au bénéficiaire
 *                 example: 123456
 *
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse utilisée pour le retrait
 *                 example: 3f7c1e9a-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 *               numero_piece:
 *                 type: string
 *                 description: Numéro de pièce d'identité du bénéficiaire
 *                 example: AB123456
 *
 *               date_operation:
 *                 type: string
 *                 format: date
 *                 description: Date réelle du retrait (YYYY-MM-DD)
 *                 example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Retrait effectué
 *               data:
 *                 message: Retrait effectué avec succès
 *                 montant: 500
 *
 *       400:
 *         description: |
 *           Erreur métier :
 *           - code secret invalide
 *           - pièce d'identité incorrecte
 *           - transfert non validé
 *           - transfert déjà retiré
 *           - caisse non autorisée
 *           - solde insuffisant
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
  roleGuard(['CAISSIER', 'ADMIN']),
  retrait
);

/**
 * @swagger
 * /api/retraits/me:
 *   get:
 *     summary: Historique des retraits de l'utilisateur connecté
 *     description: |
 *       Retourne la liste paginée des retraits effectués
 *       par l'utilisateur connecté.
 *
 *       🔎 Les données sont enrichies avec :
 *       - informations expéditeur
 *       - informations destinataire
 *       - code de référence du transfert
 *       - montant et devise du transfert
 *
 *       📊 Filtres disponibles :
 *       - statut
 *       - date_operation
 *
 *       📄 Pagination incluse
 *
 *     tags: [Retrait]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page (défaut 1)
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d’éléments par page (max 100)
 *         example: 10
 *
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *         description: Filtrer par statut
 *         example: EXECUTE
 *
 *       - in: query
 *         name: date_operation
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrer par date du retrait
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid
 *                   montant: 500
 *                   devise: USD
 *                   statut: EXECUTE
 *                   date_operation: 2026-04-24
 *                   expediteur:
 *                     nom: KABANGA
 *                     postnom: MUTOMBO
 *                     prenom: JEAN
 *                     phone: 0999999999
 *                   destinataire:
 *                     nom: MUKENDI
 *                     postnom: TSHIBALA
 *                     prenom: JOEL
 *                     phone: 0888888888
 *                   code_reference: REF123456
 *
 *               meta:
 *                 total: 10
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 1
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/me',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getMyRetraits
);

export default router;