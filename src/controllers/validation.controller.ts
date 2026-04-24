import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { validateOperationService } from '../services/validation.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const validateOperation = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const result = await validateOperationService({
      ...req.body,

      // 🔐 sécurisé
      validated_by: user.id,

      user, // 🔥 OBLIGATOIRE

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse(result.message, result));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};