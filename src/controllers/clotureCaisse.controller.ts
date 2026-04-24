import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import {
  clotureCaisseService,
  getCloturesToValidateService,
  validateClotureService
} from '../services/clotureCaisse.service.js';

import {
  successResponse,
  errorResponse
} from '../utils/apiResponse.js';

import { paginatedResponse } from '../utils/pagination.js';

/**
 * =========================================
 * 🔒 CREATE CLOTURE CAISSE
 *
 * Body attendu :
 * - caisse_id
 * - solde_physique
 * - motif_ecart (si écart)
 * - observation (optionnel)
 * - date_operation
 *
 * 🔥 created_by injecté depuis JWT
 * 🔥 ecart calculé automatiquement
 * =========================================
 */
export const clotureCaisse = async (
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
      await clotureCaisseService({
        ...req.body,

        // 🔐 sécurité
        created_by: user.id,

        // 🌐 audit
        ip: req.ip,
        user_agent:
          req.headers['user-agent']
      });

    return res.json(
      successResponse(
        result.message,
        result.cloture
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
 * 🔍 GET CLOTURES À VALIDER
 *
 * ADMIN → toutes agences
 * N+1 / N+2 → uniquement son agence
 *
 * uniquement :
 * statut = INITIE
 *
 * pagination :
 * - page
 * - limit
 * =========================================
 */
export const getCloturesToValidate = async (
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

    const page = Math.max(
      1,
      parseInt(req.query.page as string) || 1
    );

    const limit = Math.min(
      100,
      parseInt(req.query.limit as string) || 10
    );

    const offset = (page - 1) * limit;

    const {
      data,
      total
    } =
      await getCloturesToValidateService(
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
 * 🔒 VALIDATE CLOTURE
 *
 * Body attendu :
 * - cloture_id
 * - decision
 *
 * decision :
 * - APPROUVE
 * - REJETE
 *
 * 🔥 validated_by injecté depuis JWT
 * 🔥 contrôle agence appliqué
 *
 * ADMIN :
 * → peut valider toutes agences
 *
 * N+1 / N+2 :
 * → uniquement son agence
 *
 * Si APPROUVE :
 * → fermeture réelle de la caisse
 * → solde caisse = 0
 * =========================================
 */
export const validateCloture = async (
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
      await validateClotureService({
        ...req.body,

        // 🔐 sécurité
        validated_by: user.id,
        validator_role:
          user.role_name,
        validator_agence_id:
          user.agence_id,

        // 🌐 audit
        ip: req.ip,
        user_agent:
          req.headers['user-agent']
      });

    return res.json(
      successResponse(
        result.message,
        result.cloture
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(err.message)
    );
  }
};