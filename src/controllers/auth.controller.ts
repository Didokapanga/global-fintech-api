import type { RequestHandler } from 'express';
import { registerService, updateUserService, deleteUserService, loginService } from '../services/auth.service.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

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