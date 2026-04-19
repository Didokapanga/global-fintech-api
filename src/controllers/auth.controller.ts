import type { RequestHandler } from 'express';
import { registerService, updateUserService, deleteUserService, loginService, getUsersByAgenceService, getAllUsersService, getMeService } from '../services/auth.service.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import type { Response } from 'express';

// 🔥 GET ALL
export const getAllUsersController: RequestHandler = async (req, res) => {
  try {
    const users = await getAllUsersService();

    res.json(successResponse('Liste des utilisateurs', users));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
};

// 🔥 GET BY AGENCE
export const getUsersByAgenceController: RequestHandler = async (req, res) => {
  try {
    const agence_id = req.params.agence_id;

    if (!agence_id || typeof agence_id !== 'string') {
      return res.status(400).json(errorResponse('Agence id invalide'));
    }

    const users = await getUsersByAgenceService(agence_id);

    res.json(successResponse('Utilisateurs de l’agence', users));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse('Utilisateur non authentifié')
      );
    }

    const me = await getMeService(user.id);

    res.json(successResponse('Profil récupéré', me));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    const data = await loginService(user_name, password);

    res.json(successResponse('Connexion réussie', data));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const register: RequestHandler = async (req, res) => {
  try {
    const user = await registerService(req.body);

    res.json(successResponse('Utilisateur créé avec succès', user));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const updateUserController: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const user = await updateUserService(id, req.body);

    res.json(successResponse('Utilisateur mis à jour', user));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const deleteUserController: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    await deleteUserService(id);

    res.json(successResponse('Utilisateur supprimé'));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};