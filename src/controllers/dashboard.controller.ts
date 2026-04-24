import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

import {
  getDashboardOverviewService
} from '../services/dashboard.service.js';

import {
  successResponse,
  errorResponse
} from '../utils/apiResponse.js';

/**
 * =========================================
 * 📊 DASHBOARD OVERVIEW
 *
 * GET /api/dashboard/overview
 *
 * Query params :
 * - date_operation (optionnel)
 *
 * Exemple :
 * /api/dashboard/overview?date_operation=2026-04-24
 *
 * Retour :
 * - total transfert client
 * - total retrait
 * - total transfert en attente validation
 *
 * en :
 * - volume
 * - nombre
 * =========================================
 */
export const getDashboardOverview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;

    /**
     * ==========================
     * AUTH CHECK
     * ==========================
     */
    if (!user) {
      return res.status(401).json(
        errorResponse(
          'Utilisateur non authentifié'
        )
      );
    }

    /**
     * ==========================
     * SERVICE
     * ==========================
     */
    const result =
      await getDashboardOverviewService({
        date_operation:
          req.query.date_operation
      });

    /**
     * ==========================
     * RESPONSE
     * ==========================
     */
    return res.json(
      successResponse(
        'Dashboard récupéré avec succès',
        result
      )
    );

  } catch (err: any) {
    return res.status(400).json(
      errorResponse(
        err.message ||
          'Erreur dashboard'
      )
    );
  }
};