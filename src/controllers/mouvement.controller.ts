import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { createMouvementService, getAllMouvementsService, getMouvementsByAgenceService } from '../services/mouvement.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const createMouvement = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const mouvement = await createMouvementService({
      ...req.body,

      // 🔐 sécurité
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Mouvement effectué avec succès', mouvement));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// 🔹 GET ALL (ADMIN)
export const getAllMouvements = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await getAllMouvementsService(
      Number(page),
      Number(limit)
    );

    res.json(successResponse('Liste des mouvements', result));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// 🔹 GET BY AGENCE (user scope)
export const getMouvementsByAgence = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || !user.agence_id) {
      return res.status(400).json(
        errorResponse('Utilisateur ou agence_id manquant')
      );
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);

    const result = await getMouvementsByAgenceService(
      user.agence_id,
      page,
      limit
    );

    res.json(successResponse('Mouvements de l’agence', result));

  } catch (error: any) {
    console.error('ERROR GET MVT AGENCE =>', error);
    res.status(500).json(errorResponse(error.message));
  }
};