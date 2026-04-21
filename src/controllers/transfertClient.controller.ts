import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import { createTransfertClientService, getTransfertClientByAgenceService, getTransfertClientByAgentService, getTransfertsClientToValidateService, getTransfertsClientToWithdrawService } from "../services/transfertClient.service.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { paginatedResponse } from "../utils/pagination.js";

export const createTransfertClient = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await createTransfertClientService({
      ...req.body,

      // 🔐 injecté automatiquement
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Transfert créé avec succès', result));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getTransfertClientByAgence = async (req: AuthRequest, res: Response) => {
  try {
    const agence_id = req.params.agence_id as string;

    if (!agence_id) {
      return res.status(400).json(errorResponse('Agence requise'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getTransfertClientByAgenceService(
      agence_id,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getTransfertClientByAgent = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getTransfertClientByAgentService(
      user.id,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getTransfertsClientToValidate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user || !user.agence_id) {
      return res.status(401).json(
        errorResponse('Utilisateur non authentifié')
      );
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } =
      await getTransfertsClientToValidateService(
        user, // 🔥 CORRECTION ICI
        limit,
        offset
      );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getTransfertsClientToWithdraw = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user || !user.agence_id) {
      return res.status(401).json(
        errorResponse('Utilisateur non authentifié')
      );
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } =
      await getTransfertsClientToWithdrawService(
        user,
        limit,
        offset
      );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};