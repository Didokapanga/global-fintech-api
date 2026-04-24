import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import { getLedgerByCaisse, getMyLedger } from '../services/ledger.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { paginatedResponse } from '../utils/pagination.js';

export const getLedger = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    // 🔥 FIX TYPE
    const caisse_id = req.params.caisse_id as string;

    if (!caisse_id) {
      return res.status(400).json(errorResponse('caisse_id requis'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const filters = {
      type_operation: req.query.type_operation,
      sens: req.query.sens,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    const { data, total } = await getLedgerByCaisse(
      caisse_id,
      user,
      limit,
      offset,
      filters // 🔥 ajouté
    );
    
    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getMyLedgerController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getMyLedger(
      user,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};