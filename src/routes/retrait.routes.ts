import { Router } from 'express';
import { retrait } from '../controllers/retrait.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Retrait
 *   description: Retrait d’un transfert client via code secret
 */

/**
 * @swagger
 * /api/retraits:
 *   post:
 *     summary: Effectuer un retrait avec code secret
 *     description: Permet au bénéficiaire de retirer l’argent envoyé en fournissant le code secret et la référence du transfert
 *     tags: [Retrait]
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
 *               - created_by
 *             properties:
 *               code_reference:
 *                 type: string
 *                 example: REF1776443857789
 *               code_secret:
 *                 type: string
 *                 example: 123456
 *               caisse_id:
 *                 type: string
 *                 example: uuid-de-la-caisse
 *               created_by:
 *                 type: string
 *                 description: ID de l'utilisateur qui effectue le retrait
 *                 example: uuid-user
 *               numero_piece:
 *                 type: string
 *                 description: Numéro de pièce du bénéficiaire
 *                 example: AB123456
 *               devise:
 *                 type: string
 *                 description: Devise du retrait (optionnel)
 *                 example: USD
 *     responses:
 *       200:
 *         description: Retrait effectué avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Retrait effectué avec succès
 *               data:
 *                 montant: 500
 *       400:
 *         description: Erreur (code invalide, transfert déjà utilisé, caisse fermée, etc.)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Code secret invalide
 */
router.post('/', retrait);

export default router;