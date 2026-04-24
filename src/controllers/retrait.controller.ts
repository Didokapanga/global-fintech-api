import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import {
  retraitService,
  getRetraitsByAgentService
} from '../services/retrait.service.js';

import {
  successResponse,
  errorResponse
} from '../utils/apiResponse.js';

import { paginatedResponse } from '../utils/pagination.js';

/**
 * =========================================
 * RETRAIT
 * 🔥 date_operation envoyé depuis le body
 * =========================================
 */
export const retrait = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse('Non authentifié')
      );
    }

    const result = await retraitService({
      ...req.body,

      // 🔐 sécurité
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(
      successResponse(
        'Retrait effectué',
        result
      )
    );

  } catch (err: any) {
    res.status(400).json(
      errorResponse(err.message)
    );
  }
};

/**
 * =========================================
 * HISTORIQUE RETRAITS
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export const getMyRetraits = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse('Non authentifié')
      );
    }

    // pagination
    const page = Math.max(
      1,
      parseInt(req.query.page as string) || 1
    );

    const limit = Math.min(
      100,
      parseInt(req.query.limit as string) || 10
    );

    const offset = (page - 1) * limit;

    // 🔥 filtres ajoutés
    const filters = {
      statut: req.query.statut as string,
      date_operation:
        req.query.date_operation as string
    };

    const { data, total } =
      await getRetraitsByAgentService(
        user,
        limit,
        offset,
        filters
      );

    res.json(
      paginatedResponse(
        data,
        total,
        page,
        limit
      )
    );

  } catch (err: any) {
    res.status(400).json(
      errorResponse(err.message)
    );
  }
};