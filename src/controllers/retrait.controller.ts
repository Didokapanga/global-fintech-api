import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { retraitService } from '../services/retrait.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const retrait = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await retraitService({
      ...req.body,

      // 🔐 sécurisé
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse(result.message, result));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};
