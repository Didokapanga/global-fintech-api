import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { createMouvementService } from '../services/mouvement.service.js';
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