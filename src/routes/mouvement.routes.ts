import { Router } from 'express';
import { createMouvement } from '../controllers/mouvement.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Mouvements
 *   description: Gestion des mouvements de caisse
 */

/**
 * @swagger
 * /api/mouvements:
 *   post:
 *     summary: Effectuer un mouvement de caisse
 *     tags: [Mouvements]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caisse_id
 *               - montant
 *               - type_mouvement
 *               - devise
 *             properties:
 *               caisse_id:
 *                 type: string
 *               montant:
 *                 type: number
 *               type_mouvement:
 *                 type: string
 *                 example: "APPROVISIONNEMENT"
 *               devise:
 *                 type: string
 *                 example: "USD"
 *               reference_type:
 *                 type: string
 *               code_reference:
 *                 type: string
 *               created_by:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mouvement effectué
 */
router.post('/', createMouvement);

export default router;