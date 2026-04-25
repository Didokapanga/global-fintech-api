import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import {
  retraitService,
  validateRetraitService,
  getRetraitsToValidateService,
  getRetraitsByAgentService
} from '../services/retrait.service.js';

import {
  successResponse,
  errorResponse
} from '../utils/apiResponse.js';

import { paginatedResponse } from '../utils/pagination.js';

/**
 * =========================================
 * INITIER RETRAIT
 *
 * CAISSIER :
 * → crée retrait INITIE
 *
 * 🔥 date_operation envoyé depuis le body
 * 🔥 aucun débit immédiat
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

    const result =
      await retraitService({
        ...req.body,

        /**
         * sécurité
         */
        created_by: user.id,

        /**
         * audit
         */
        ip: req.ip,
        user_agent:
          req.headers['user-agent']
      });

    return res.json(
      successResponse(
        result.message,
        result.retrait
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(err.message)
    );
  }
};

/**
 * =========================================
 * VALIDER RETRAIT
 *
 * N+1 / N+2 / ADMIN
 *
 * APPROUVE :
 * → débit réel caisse
 * → retrait EXECUTE
 * → transfert EXECUTE
 *
 * REJETE :
 * → retrait REJETE
 * =========================================
 */
export const validateRetrait = async (
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

    const result =
      await validateRetraitService({
        ...req.body,

        /**
         * sécurité
         */
        validated_by: user.id,
        validator_role:
          user.role_name?.toUpperCase(),
        validator_agence_id:
          user.agence_id,

        /**
         * audit
         */
        ip: req.ip,
        user_agent:
          req.headers['user-agent']
      });

    return res.json(
      successResponse(
        result.message,
        result.retrait
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(err.message)
    );
  }
};

/**
 * =========================================
 * RETRAITS À VALIDER
 *
 * ADMIN :
 * → tous les retraits INITIE
 *
 * N+1 / N+2 :
 * → seulement leur agence
 * =========================================
 */
export const getRetraitsToValidate = async (
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

    /**
     * pagination
     */
    const page = Math.max(
      1,
      parseInt(
        req.query.page as string
      ) || 1
    );

    const limit = Math.min(
      100,
      parseInt(
        req.query.limit as string
      ) || 10
    );

    const offset =
      (page - 1) * limit;

    const { data, total } =
      await getRetraitsToValidateService(
        user,
        limit,
        offset
      );

    return res.json(
      paginatedResponse(
        data,
        total,
        page,
        limit
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(err.message)
    );
  }
};

/**
 * =========================================
 * HISTORIQUE RETRAITS
 *
 * filtres :
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

    /**
     * pagination
     */
    const page = Math.max(
      1,
      parseInt(
        req.query.page as string
      ) || 1
    );

    const limit = Math.min(
      100,
      parseInt(
        req.query.limit as string
      ) || 10
    );

    const offset =
      (page - 1) * limit;

    /**
     * filtres
     */
    const filters = {
      statut:
        req.query.statut as string,

      date_operation:
        req.query
          .date_operation as string
    };

    const { data, total } =
      await getRetraitsByAgentService(
        user,
        limit,
        offset,
        filters
      );

    return res.json(
      paginatedResponse(
        data,
        total,
        page,
        limit
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(err.message)
    );
  }
};