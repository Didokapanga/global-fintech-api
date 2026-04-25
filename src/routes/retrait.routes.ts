import { Router } from 'express';
import {
  retrait,
  validateRetrait,
  getMyRetraits,
  getRetraitsToValidate
} from '../controllers/retrait.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Retrait
 *   description: Gestion des retraits (cash-out sécurisé avec validation hiérarchique)
 */

/**
 * @swagger
 * /api/retraits:
 *   post:
 *     summary: Initier un retrait sécurisé
 *     description: |
 *       Permet au caissier d’initier un retrait
 *       sur un transfert client déjà validé.
 *
 *       🔐 Vérifications métier :
 *       - vérification du code secret
 *       - vérification du numéro de pièce du bénéficiaire (KYC)
 *       - vérification de l’agence de destination
 *       - vérification que la caisse appartient au caissier connecté
 *       - vérification que la caisse est ouverte
 *
 *       ⚠️ Le transfert doit être au statut :
 *       VALIDE
 *
 *       📌 Nouveau workflow :
 *
 *       CAISSIER :
 *       → crée un retrait au statut INITIE
 *
 *       N+1 / N+2 / ADMIN :
 *       → valide ensuite le retrait
 *
 *       🔥 Aucun débit immédiat
 *       🔥 Aucun ledger immédiat
 *
 *       📅 `date_operation`
 *       représente la vraie date métier
 *       du retrait (sans heure)
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
 *                 description: Code secret remis au bénéficiaire
 *                 example: 123456
 *
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse utilisée
 *                 example: uuid-caisse
 *
 *               numero_piece:
 *                 type: string
 *                 description: Numéro de pièce du bénéficiaire
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
 *         description: Retrait initié avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Retrait initié avec succès, en attente de validation
 *               data:
 *                 id: uuid
 *                 statut: INITIE
 *                 montant: 500
 *                 devise: USD
 *
 *       400:
 *         description: |
 *           Erreur métier :
 *           - code secret invalide
 *           - pièce invalide
 *           - transfert non validé
 *           - transfert déjà retiré
 *           - caisse non autorisée
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
 * /api/retraits/validate:
 *   post:
 *     summary: Valider ou rejeter un retrait
 *     description: |
 *       Permet à un supérieur hiérarchique
 *       (N+1 / N+2 / ADMIN)
 *       de traiter un retrait INITIE.
 *
 *       📌 Si APPROUVE :
 *       - débit réel de la caisse
 *       - retrait → EXECUTE
 *       - transfert client → EXECUTE
 *       - création du ledger
 *
 *       📌 Si REJETE :
 *       - retrait → REJETE
 *       - aucun débit
 *
 *       🔐 Validation limitée :
 *       - ADMIN → global
 *       - N+1 / N+2 → uniquement leur agence
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
 *               - retrait_id
 *               - decision
 *
 *             properties:
 *               retrait_id:
 *                 type: string
 *                 description: ID du retrait à traiter
 *                 example: uuid-retrait
 *
 *               decision:
 *                 type: string
 *                 enum:
 *                   - APPROUVE
 *                   - REJETE
 *                 description: Décision de validation
 *                 example: APPROUVE
 *
 *     responses:
 *       200:
 *         description: Retrait traité avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Retrait validé avec succès
 *               data:
 *                 id: uuid
 *                 statut: EXECUTE
 *
 *       400:
 *         description: Erreur métier
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.post(
  '/validate',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  validateRetrait
);

/**
 * @swagger
 * /api/retraits/validation:
 *   get:
 *     summary: Récupérer les retraits en attente de validation
 *     description: |
 *       Permet aux profils hiérarchiques
 *       (ADMIN, N+1, N+2)
 *       de consulter la liste des retraits
 *       au statut **INITIE**
 *       en attente de validation.
 *
 *       📌 Règles métier :
 *
 *       ADMIN :
 *       → voit tous les retraits INITIE
 *
 *       N+1 / N+2 :
 *       → voient uniquement
 *       les retraits de leur agence
 *
 *       📊 Pagination incluse
 *
 *       🔎 Données enrichies :
 *       - informations expéditeur
 *       - informations destinataire
 *       - code de référence transfert
 *       - montant du transfert
 *       - devise
 *
 *     tags: [Retrait]
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
 *         description: Nombre d’éléments par page (max 100)
 *
 *     responses:
 *       200:
 *         description: Liste des retraits à valider récupérée avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: uuid-retrait
 *                   statut: INITIE
 *                   montant: 500
 *                   devise: USD
 *                   date_operation: 2026-04-24
 *                   code_reference: REF17123456789
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
 *
 *               meta:
 *                 total: 12
 *                 page: 1
 *                 limit: 10
 *                 totalPages: 2
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/validation',
  authMiddleware,
  roleGuard([
    'ADMIN',
    'N+1',
    'N+2',
    'CAISSIER'
  ]),
  getRetraitsToValidate
);

/**
 * @swagger
 * /api/retraits/me:
 *   get:
 *     summary: Historique des retraits de l'utilisateur connecté
 *     description: |
 *       Retourne la liste paginée
 *       des retraits liés à l’utilisateur connecté.
 *
 *       🔎 Données enrichies :
 *       - expéditeur
 *       - destinataire
 *       - code de référence
 *       - montant du transfert
 *       - devise
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
 *         description: Filtrer par date métier
 *         example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
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
  roleGuard([
    'CAISSIER',
    'ADMIN',
    'N+1',
    'N+2'
  ]),
  getMyRetraits
);

export default router;