import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import {
  createTransfertClientService,
  getTransfertClientByAgenceService,
  getTransfertClientByAgentService,
  getTransfertsClientToValidateService,
  getTransfertsClientToWithdrawService
} from "../services/transfertClient.service.js";

import {
  errorResponse,
  successResponse
} from "../utils/apiResponse.js";

import { paginatedResponse } from "../utils/pagination.js";

/**
 * =========================================
 * CREATE TRANSFERT CLIENT
 * 🔥 date_operation envoyé depuis le body
 * =========================================
 */
export const createTransfertClient = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse("Utilisateur non authentifié")
      );
    }

    const result = await createTransfertClientService({
      ...req.body,

      // 🔐 injecté automatiquement
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers["user-agent"]
    });

    res.json(
      successResponse(
        "Transfert créé avec succès",
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
 * GET TRANSFERTS CLIENT PAR AGENCE
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export const getTransfertClientByAgence = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const agence_id = req.params.agence_id as string;

    if (!agence_id) {
      return res.status(400).json(
        errorResponse("Agence requise")
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

    // 🔥 filtres
    const filters = {
      statut: req.query.statut as string,
      date_operation:
        req.query.date_operation as string
    };

    const { data, total } =
      await getTransfertClientByAgenceService(
        agence_id,
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

/**
 * =========================================
 * GET TRANSFERTS CLIENT DE L'UTILISATEUR
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export const getTransfertClientByAgent = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(
        errorResponse("Non authentifié")
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

    // 🔥 filtres
    const filters = {
      statut: req.query.statut as string,
      date_operation:
        req.query.date_operation as string
    };

    const { data, total } =
      await getTransfertClientByAgentService(
        user.id,
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

/**
 * =========================================
 * GET TRANSFERTS CLIENT À VALIDER
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export const getTransfertsClientToValidate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user || !user.agence_id) {
      return res.status(401).json(
        errorResponse(
          "Utilisateur non authentifié"
        )
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

    // 🔥 filtres
    const filters = {
      statut: req.query.statut as string,
      date_operation:
        req.query.date_operation as string
    };

    const { data, total } =
      await getTransfertsClientToValidateService(
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

/**
 * =========================================
 * GET TRANSFERTS CLIENT DISPONIBLES
 * POUR RETRAIT
 * + filtres :
 * - statut
 * - date_operation
 * =========================================
 */
export const getTransfertsClientToWithdraw = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user || !user.agence_id) {
      return res.status(401).json(
        errorResponse(
          "Utilisateur non authentifié"
        )
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

    // 🔥 filtres
    const filters = {
      statut: req.query.statut as string,
      date_operation:
        req.query.date_operation as string
    };

    const { data, total } =
      await getTransfertsClientToWithdrawService(
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