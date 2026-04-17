import { Router } from 'express';
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient
} from '../controllers/client.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestion des clients
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Liste des clients (avec pagination)
 *     tags: [Clients]
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
 *         description: Liste des clients
 */
router.get('/', getClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Détail d’un client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client trouvé
 *       404:
 *         description: Client non trouvé
 */
router.get('/:id', getClient);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Créer un client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               second_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               commune:
 *                 type: string
 *               quartier:
 *                 type: string
 *               ville:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client créé
 *       400:
 *         description: Erreur de validation
 */
router.post('/', createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Mettre à jour un client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du client
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Client mis à jour
 *       400:
 *         description: Erreur
 */
router.put('/:id', updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Supprimer un client (soft delete)
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du client
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client supprimé
 */
router.delete('/:id', deleteClient);

export default router;