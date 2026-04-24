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
 *   name: MouvementCaisse
 *   description: Gestion des mouvements de caisse
 */

/**
 * @swagger
 * /api/mouvements:
 *   post:
 *     summary: Créer un mouvement de caisse
 *     description: |
 *       Permet d’enregistrer un mouvement de caisse manuel.
 *
 *       📌 Exemples :
 *       - approvisionnement
 *       - retrait manuel
 *       - correction de caisse
 *       - entrée exceptionnelle
 *       - sortie exceptionnelle
 *
 *       🔐 Sécurité métier :
 *       - la caisse doit être ouverte
 *       - pour une sortie, le solde doit être suffisant
 *
 *       📅 `date_operation` représente la vraie date métier
 *       de l’opération comptable (sans heure).
 *
 *       📌 Le statut est automatiquement :
 *       EXECUTE
 *
 *     tags: [MouvementCaisse]
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
 *               - type_mouvement
 *               - montant
 *               - devise
 *               - reference_type
 *               - date_operation
 *
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse concernée
 *                 example: uuid-caisse
 *
 *               type_mouvement:
 *                 type: string
 *                 description: Type du mouvement
 *                 example: APPROVISIONNEMENT
 *
 *               montant:
 *                 type: number
 *                 description: Montant du mouvement
 *                 example: 500
 *
 *               devise:
 *                 type: string
 *                 description: Devise utilisée
 *                 example: USD
 *
 *               reference_type:
 *                 type: string
 *                 description: Origine métier du mouvement
 *                 example: MOUVEMENT_MANUEL
 *
 *               date_operation:
 *                 type: string
 *                 format: date
 *                 description: Date réelle de l'opération (YYYY-MM-DD)
 *                 example: 2026-04-24
 *
 *     responses:
 *       200:
 *         description: Mouvement effectué avec succès
 *
 *       400:
 *         description: Erreur de validation métier
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
 *       - Tri par date décroissante
 *       - Filtres avancés :
 *         - type_mouvement
 *         - devise
 *         - statut
 *         - date_operation
 *
 *     tags: [MouvementCaisse]
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
 *       - in: query
 *         name: type_mouvement
 *         schema:
 *           type: string
 *         description: Filtrer par type de mouvement
 *         example: APPROVISIONNEMENT
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
 *         description: Filtrer par statut
 *         example: EXECUTE
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
 *         description: Liste paginée des mouvements
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès interdit (réservé ADMIN)
 */
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
 *       - Filtres avancés :
 *         - type_mouvement
 *         - devise
 *         - statut
 *         - date_operation
 *
 *     tags: [MouvementCaisse]
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
 *       - in: query
 *         name: type_mouvement
 *         schema:
 *           type: string
 *         description: Filtrer par type de mouvement
 *         example: APPROVISIONNEMENT
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
 *         description: Filtrer par statut
 *         example: EXECUTE
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
 *         description: Liste paginée des mouvements de l’agence
 *
 *       401:
 *         description: Non authentifié
 *
 *       403:
 *         description: Accès refusé
 */
router.get(
  '/agence',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  getMouvementsByAgence
);

export default router;