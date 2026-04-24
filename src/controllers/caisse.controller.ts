import type { RequestHandler } from 'express';
import {
  createCaisseService,
  getCaissesService,
  getCaisseService,
  updateCaisseService,
  deleteCaisseService,
  openCaisseService,
  closeCaisseService,
  getCaissesByAgenceService
} from '../services/caisse.service.js';

import { paginatedResponse } from '../utils/pagination.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

// ==========================
// CREATE
// ==========================
export const createCaisse: RequestHandler = async (req, res) => {
  try {
    const caisse = await createCaisseService(req.body);
    res.json(successResponse('Caisse créée avec succès', caisse));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// GET ALL
// ==========================
export const getCaisses: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getCaissesService(
      user,
      page,
      limit,
      offset
    );

    res.json(paginatedResponse(data, total, page, limit));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// GET ONE
// ==========================
export const getCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const caisse = await getCaisseService(id);

    res.json(successResponse('Caisse récupérée', caisse));
  } catch (error: any) {
    res.status(404).json(errorResponse(error.message));
  }
};

// ==========================
// OPEN CAISSE (FIX + AUDIT)
// ==========================
export const openCaisse: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const id = req.params.id as string;

    const caisse = await openCaisseService(id, user, {
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Caisse ouverte avec succès', caisse));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// CLOSE CAISSE (FIX + AUDIT)
// ==========================
export const closeCaisse: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const id = req.params.id as string;

    const caisse = await closeCaisseService(id, user, {
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Caisse fermée avec succès', caisse));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// GET BY AGENCE
// ==========================
export const getCaissesByAgence: RequestHandler = async (req, res) => {
  try {
    const agence_id = req.params.agence_id as string;

    const caisses = await getCaissesByAgenceService(agence_id);

    res.json(successResponse('Caisses récupérées', caisses));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// UPDATE (FIX + AUDIT)
// ==========================
export const updateCaisse: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const id = req.params.id as string;

    const caisse = await updateCaisseService(
      id,
      req.body,
      user,
      {
        ip: req.ip,
        user_agent: req.headers['user-agent']
      }
    );

    res.json(successResponse('Caisse mise à jour', caisse));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

// ==========================
// DELETE (FIX + AUDIT)
// ==========================
export const deleteCaisse: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Non authentifié'));
    }

    const id = req.params.id as string;

    await deleteCaisseService(
      id,
      user,
      {
        ip: req.ip,
        user_agent: req.headers['user-agent']
      }
    );

    res.json(successResponse('Caisse désactivée'));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};