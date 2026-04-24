import { Router } from 'express';
import {
  clotureCaisse,
  getCloturesToValidate,
  validateCloture
} from '../controllers/clotureCaisse.controller.js';

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ClotureCaisse
 *   description: Gestion des clôtures de caisse
 */

/**
 * @swagger
 * /api/clotures:
 *   post:
 *     summary: Initier une clôture de caisse
 *     description: |
 *       Permet au caissier de lancer une clôture de caisse.
 *
 *       Le système :
 *       - récupère automatiquement le solde système
 *       - compare avec le solde physique saisi
 *       - calcule automatiquement l’écart
 *
 *       🔥 L’écart n’est plus envoyé dans le body
 *
 *       📅 `date_operation` représente la vraie date métier
 *       de la clôture (sans heure)
 *
 *       📌 Si ecart = 0 :
 *       → validation automatique
 *       → fermeture immédiate de la caisse
 *       → remise du solde à 0
 *
 *       📌 Si ecart ≠ 0 :
 *       → statut INITIE
 *       → validation hiérarchique obligatoire
 *
 *       🔐 `created_by` est injecté automatiquement via JWT
 *
 *     tags: [ClotureCaisse]
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
 *               - solde_physique
 *               - date_operation
 *
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse à clôturer
 *                 example: uuid-caisse
 *
 *               solde_physique:
 *                 type: number
 *                 description: Solde réellement compté physiquement
 *                 example: 950
 *
 *               motif_ecart:
 *                 type: string
 *                 description: Obligatoire si un écart est détecté
 *                 example: Différence de comptage
 *
 *               observation:
 *                 type: string
 *                 description: Observation libre de l’agent
 *                 example: Billet manquant en attente de vérification
 *
 *               date_operation:
 *                 type: string
 *                 format: date
 *                 description: Date réelle de clôture (YYYY-MM-DD)
 *                 example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Clôture initiée ou validée automatiquement
 *       400:
 *         description: Erreur métier
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN']),
  clotureCaisse
);

/**
 * @swagger
 * /api/clotures/validation:
 *   get:
 *     summary: Liste des clôtures à valider
 *     description: |
 *       Retourne toutes les clôtures en attente de validation.
 *
 *       🔥 uniquement :
 *       - statut = INITIE
 *
 *       🔐 Règles d’accès :
 *
 *       ADMIN :
 *       → voit toutes les clôtures de toutes les agences
 *
 *       N+1 / N+2 :
 *       → voit uniquement les clôtures de son agence
 *
 *       📄 Support pagination :
 *       - page
 *       - limit
 *
 *     tags: [ClotureCaisse]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Numéro de page
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Nombre d’éléments par page
 *
 *     responses:
 *       200:
 *         description: Liste des clôtures à valider
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/validation',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2', 'CAISSIER']),
  getCloturesToValidate
);

/**
 * @swagger
 * /api/clotures/validate:
 *   post:
 *     summary: Valider ou rejeter une clôture de caisse
 *     description: |
 *       Permet au supérieur hiérarchique
 *       (ADMIN / N+1 / N+2)
 *       de traiter une clôture initiée.
 *
 *       🔐 Sécurité agence :
 *
 *       ADMIN :
 *       → peut valider toutes les agences
 *
 *       N+1 / N+2 :
 *       → peut valider uniquement
 *         les clôtures de son agence
 *
 *       📌 Si APPROUVE :
 *       - statut → VALIDE
 *       - caisse fermée
 *       - solde caisse remis à 0
 *
 *       📌 Si REJETE :
 *       - statut → REJETE
 *       - la caisse reste ouverte
 *
 *       🔐 `validated_by` injecté automatiquement via JWT
 *
 *     tags: [ClotureCaisse]
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
 *               - cloture_id
 *               - decision
 *
 *             properties:
 *               cloture_id:
 *                 type: string
 *                 description: ID de la clôture à traiter
 *                 example: uuid-cloture
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
 *         description: Clôture traitée avec succès
 *       400:
 *         description: Erreur métier
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.post(
  '/validate',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  validateCloture
);

export default router;