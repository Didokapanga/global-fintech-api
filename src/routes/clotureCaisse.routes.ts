import { Router } from 'express';
import { clotureCaisse } from '../controllers/clotureCaisse.controller.js';

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
 *     summary: Clôturer une caisse
 *     description: Permet de clôturer une caisse en comparant le solde système avec le solde physique. L’écart peut être calculé automatiquement ou fourni manuellement.
 *     tags: [ClotureCaisse]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caisse_id
 *               - solde_physique
 *               - created_by
 *             properties:
 *               caisse_id:
 *                 type: string
 *                 description: ID de la caisse à clôturer
 *                 example: uuid-caisse
 *               solde_physique:
 *                 type: number
 *                 description: Montant réel compté physiquement
 *                 example: 950
 *               ecart:
 *                 type: number
 *                 description: Ecart manuel (optionnel). Si non fourni, il sera calculé automatiquement
 *                 example: -50
 *               created_by:
 *                 type: string
 *                 description: ID de l'utilisateur qui effectue la clôture
 *                 example: uuid-user
 *     responses:
 *       200:
 *         description: Clôture effectuée avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Clôture effectuée
 *               data:
 *                 id: uuid
 *                 caisse_id: uuid
 *                 solde_systeme: 1000
 *                 solde_physique: 950
 *                 ecart: -50
 *                 devise: USD
 *                 statut: INITIE
 *       400:
 *         description: Erreur (caisse introuvable, déjà fermée, données invalides, etc.)
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Caisse déjà fermée
 */
router.post('/', clotureCaisse);

export default router;