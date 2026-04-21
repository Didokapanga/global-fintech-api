import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { getRetraitsByAgentService, retraitService } from '../services/retrait.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { paginatedResponse } from '../utils/pagination.js';

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

// 🔍 HISTORIQUE RETRAIT PAR AGENT
export const getMyRetraits = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getRetraitsByAgentService(
      user,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};