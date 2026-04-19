import { Router } from 'express';
import { register, login, deleteUserController, updateUserController, getUsersByAgenceController, getAllUsersController, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleGuard } from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification
 */

/**
 * @swagger
 * /api/auth:
 *   get:
 *     summary: Liste de tous les utilisateurs
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
router.get('/', authMiddleware, roleGuard(['ADMIN']), getAllUsersController);

/**
 * @swagger
 * /api/auth/agence/{agence_id}:
 *   get:
 *     summary: Liste des utilisateurs par agence
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agence_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateurs de l’agence
 */
router.get('/agence/:agence_id', authMiddleware, roleGuard(['ADMIN', 'N+1']),getUsersByAgenceController);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Profil récupéré
 *               data:
 *                 id: uuid
 *                 user_name: admin
 *                 role_name: ADMIN
 *                 agence_name: Kinshasa
 *       401:
 *         description: Non authentifié
 */
router.get('/me', authMiddleware, getMe);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *               agence_id:
 *                 type: string
 *               user_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur créé
*/

router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT
*/

router.post('/login', login);

/**
 * @swagger
 * /api/auth/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *               agence_id:
 *                 type: string
 *               user_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
router.put('/:id', updateUserController);

/**
 * @swagger
 * /api/auth/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID UUID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
router.delete('/:id', deleteUserController);

export default router;