import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { transfertCaisseService } from '../services/transfert.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const transfertCaisse = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await transfertCaisseService({
      ...req.body,

      // 🔐 sécurisé
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Transfert effectué avec succès', result));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};