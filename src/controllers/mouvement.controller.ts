import type { RequestHandler } from 'express';
import { createMouvementService } from '../services/mouvement.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createMouvement: RequestHandler = async (req, res) => {
  try {
    const mouvement = await createMouvementService(req.body);

    res.json(successResponse('Mouvement effectué avec succès', mouvement));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};