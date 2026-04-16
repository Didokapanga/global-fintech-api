import { Router } from 'express';
import { getRoles, createRole } from '../controllers/role.controller.js';

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

export default router;