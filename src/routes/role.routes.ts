import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestion des rôles
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Liste des rôles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Liste des rôles
 */

router.get('/', getRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Créer un rôle
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rôle créé
 */

router.post('/', createRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Mettre à jour un rôle
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID du rôle
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "N1"
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       400:
 *         description: Données invalides
 */
router.put('/:id', updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Désactiver un rôle (soft delete)
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID du rôle
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rôle désactivé avec succès
 *       404:
 *         description: Rôle non trouvé
 */
router.delete('/:id', deleteRole);

export default router;