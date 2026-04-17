import { Router } from 'express';
import {
  getAgences,
  getAgence,
  createAgence,
  deleteAgence
} from '../controllers/agence.controller.js';
import { updateAgence } from '../repositories/agence.repository.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Agences
 *   description: Gestion des agences
 */

/**
 * @swagger
 * /api/agences:
 *   get:
 *     summary: Liste des agences
 *     tags: [Agences]
 *     responses:
 *       200:
 *         description: Liste des agences récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "uuid"
 *                   libelle:
 *                     type: string
 *                     example: "Agence Kinshasa Centre"
 *                   code_agence:
 *                     type: string
 *                     example: "KIN001"
 *                   ville:
 *                     type: string
 *                     example: "Kinshasa"
 *                   commune:
 *                     type: string
 *                     example: "Gombe"
 *                   quartier:
 *                     type: string
 *                     example: "Centre"
 *                   is_activated:
 *                     type: boolean
 *                     example: true
 *                   created_at:
 *                     type: string
 *                     example: "2026-01-01T10:00:00Z"
 */

router.get('/', getAgences);

/**
 * @swagger
 * /api/agences:
 *   post:
 *     summary: Créer une agence
 *     tags: [Agences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - code_agence
 *               - ville
 *             properties:
 *               libelle:
 *                 type: string
 *                 example: "Agence Kinshasa Centre"
 *               code_agence:
 *                 type: string
 *                 example: "KIN001"
 *               ville:
 *                 type: string
 *                 example: "Kinshasa"
 *               commune:
 *                 type: string
 *                 example: "Gombe"
 *               quartier:
 *                 type: string
 *                 example: "Centre"
 *     responses:
 *       200:
 *         description: Agence créée avec succès
 *       400:
 *         description: Données invalides
 */

router.post('/', createAgence);

/**
 * @swagger
 * /api/agences/{id}:
 *   get:
 *     summary: Détail d'une agence
 *     tags: [Agences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de l'agence
 *         schema:
 *           type: string
 *           example: "uuid"
 *     responses:
 *       200:
 *         description: Agence trouvée
 *       404:
 *         description: Agence non trouvée
 */

router.get('/:id', getAgence);

/**
 * @swagger
 * /api/agences/{id}:
 *   put:
 *     summary: Mettre à jour une agence
 *     tags: [Agences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de l'agence
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *               - code_agence
 *               - ville
 *             properties:
 *               libelle:
 *                 type: string
 *                 example: "Agence Kinshasa Centre"
 *               code_agence:
 *                 type: string
 *                 example: "KIN001"
 *               ville:
 *                 type: string
 *                 example: "Kinshasa"
 *               commune:
 *                 type: string
 *                 example: "Gombe"
 *               quartier:
 *                 type: string
 *                 example: "Centre"
 *     responses:
 *       200:
 *         description: Agence mise à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Agence non trouvée
 */
router.put('/:id', updateAgence);

/**
 * @swagger
 * /api/agences/{id}:
 *   delete:
 *     summary: Désactiver une agence (soft delete)
 *     tags: [Agences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de l'agence
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agence désactivée avec succès
 *       404:
 *         description: Agence non trouvée
 */
router.delete('/:id', deleteAgence);

export default router;