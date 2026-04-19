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
router.get('/', getCaisses);

/**
 * @swagger
 * /api/caisses:
 *   post:
 *     summary: Créer une caisse
 *     tags: [Caisses]
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
 *               - code_caisse
 *             properties:
 *               agence_id:
 *                 type: string
 *                 example: "uuid"
 *               agent_id:
 *                 type: string
 *                 example: "uuid"
 *               type:
 *                 type: string
 *                 example: "AGENCE"
 *               devise:
 *                 type: string
 *                 example: "USD"
 *               code_caisse:
 *                 type: string
 *                 example: "CAISSE001"
 *     responses:
 *       200:
 *         description: Caisse créée avec succès
 *       400:
 *         description: Données invalides
 */
router.post('/', createCaisse);

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
router.get('/agence/:agence_id', getCaissesByAgence);

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
router.get('/:id', getCaisse);

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
router.post('/:id/open', openCaisse);

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
router.post('/:id/close', closeCaisse);

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
router.put('/:id', updateCaisse);

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
router.delete('/:id', deleteCaisse);

export default router;