import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { validateClotureService } from '../services/clotureCaisse.service.js';

export const validateCloture = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await validateClotureService({
      ...req.body,

      // 🔐 sécurisé
      validated_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse(result.message, result.cloture));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};