import { Router } from 'express';
import {
  createCaisse,
  getCaisses,
  getCaisse,
  updateCaisse,
  deleteCaisse,
  closeCaisse,
  openCaisse,
  getCaissesByAgence
} from '../controllers/caisse.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Caisses
 *   description: Gestion des caisses
 */

/**
 * @swagger
 * /api/caisses:
 *   get:
 *     summary: Liste des caisses actives
 *     tags: [Caisses]
 *     responses:
 *       200:
 *         description: Liste des caisses
 */
router.get(
  '/', 
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getCaisses);

/**
 * @swagger
 * /api/caisses:
 *   post:
 *     summary: Créer une caisse
 *     description: |
 *       Permet de créer une nouvelle caisse.
 *
 *       🔥 Le champ `code_caisse` est généré automatiquement
 *       par le système selon le code agence.
 *
 *       Exemple :
 *
 *       Si l’agence possède :
 *       - code_agence = 100000
 *
 *       alors les caisses seront :
 *       - 100001
 *       - 100002
 *       - 100003
 *
 *       Si l’agence possède :
 *       - code_agence = 101000
 *
 *       alors :
 *       - 101001
 *       - 101002
 *
 *       Le frontend ne doit donc plus envoyer `code_caisse`.
 *
 *       📌 La caisse est créée par défaut avec :
 *       - state = FERMEE
 *
 *     tags: [Caisses]
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
 *               - agence_id
 *               - type
 *               - devise
 *
 *             properties:
 *               agence_id:
 *                 type: string
 *                 description: ID de l’agence propriétaire
 *                 example: uuid-agence
 *
 *               agent_id:
 *                 type: string
 *                 description: |
 *                   ID du caissier assigné.
 *                   Peut être null pour une caisse agence.
 *                 example: uuid-agent
 *
 *               type:
 *                 type: string
 *                 description: Type de caisse
 *                 example: AGENCE
 *
 *               devise:
 *                 type: string
 *                 description: Devise principale de la caisse
 *                 example: USD
 *
 *     responses:
 *       200:
 *         description: Caisse créée avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Caisse créée avec succès
 *               data:
 *                 id: uuid
 *                 agence_id: uuid-agence
 *                 agent_id: uuid-agent
 *                 type: AGENCE
 *                 devise: USD
 *                 code_caisse: "100001"
 *                 state: FERMEE
 *
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: agence_id, type et devise sont requis
 */
router.post(
  '/',
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  createCaisse
);

/**
 * @swagger
 * /api/caisses/agence/{agence_id}:
 *   get:
 *     summary: Liste des caisses par agence
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: agence_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des caisses
 */
router.get(
  '/agence/:agence_id', 
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getCaissesByAgence);

/**
 * @swagger
 * /api/caisses/{id}:
 *   get:
 *     summary: Détail d'une caisse
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de la caisse
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caisse trouvée
 *       404:
 *         description: Caisse non trouvée
 */
router.get(
  '/:id', 
  authMiddleware,
  roleGuard(['CAISSIER', 'ADMIN', 'N+1', 'N+2']),
  getCaisse);

/**
 * @swagger
 * /api/caisses/{id}/open:
 *   post:
 *     summary: Ouvrir une caisse
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la caisse
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caisse ouverte avec succès
 */
router.post(
  '/:id/open',
  authMiddleware,
  roleGuard(['CAISSIER', 'N+1', 'N+2']),
  openCaisse);

/**
 * @swagger
 * /api/caisses/{id}/close:
 *   post:
 *     summary: Fermer une caisse
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la caisse
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caisse fermée avec succès
 */
router.post(
  '/:id/close', 
  authMiddleware,
  roleGuard(['CAISSIER', 'N+1', 'N+2']),
  closeCaisse);

/**
 * @swagger
 * /api/caisses/{id}:
 *   put:
 *     summary: Mettre à jour une caisse
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de la caisse
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agence_id:
 *                 type: string
 *               agent_id:
 *                 type: string
 *               type:
 *                 type: string
 *               devise:
 *                 type: string
 *               code_caisse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caisse mise à jour
 *       400:
 *         description: Données invalides
 */
router.put(
  '/:id', 
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  updateCaisse);

/**
 * @swagger
 * /api/caisses/{id}:
 *   delete:
 *     summary: Désactiver une caisse (soft delete)
 *     tags: [Caisses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de la caisse
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Caisse désactivée avec succès
 *       404:
 *         description: Caisse non trouvée
 */
router.delete(
  '/:id', 
  authMiddleware,
  roleGuard(['ADMIN', 'N+1', 'N+2']),
  deleteCaisse);

export default router;