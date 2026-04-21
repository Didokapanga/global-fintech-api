import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import {
  getTransfertsCaisseToProcessService,
  getTransfertsService,
  transfertCaisseService
} from '../services/transfert.service.js';

import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { paginatedResponse } from '../utils/pagination.js';
import { getTransfertsByAgent } from '../repositories/transfert.repository.js';

// 🔍 GET ALL
export const getTransferts = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getTransfertsService(user, limit, offset);

    res.json(paginatedResponse(data, total, page, limit));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// 🔍 GET BY ID
export const getMyTransferts = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getTransfertsByAgent(
      user.id,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

// 🔥 CREATE
export const transfertCaisse = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await transfertCaisseService({
      ...req.body,
      created_by: user.id,
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Transfert effectué avec succès', result));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const getTransfertsCaisseToProcess = async (
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

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } =
      await getTransfertsCaisseToProcessService(
        user, // 🔥 IMPORTANT
        limit,
        offset
      );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};