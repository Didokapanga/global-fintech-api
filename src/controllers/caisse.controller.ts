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

export const createCaisse: RequestHandler = async (req, res) => {
  try {
    const caisse = await createCaisseService(req.body);

    res.json(successResponse('Caisse créée avec succès', caisse));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const getCaisses: RequestHandler = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getCaissesService(page, limit, offset);

    res.json(paginatedResponse(data, total, page, limit));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
};

export const getCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const caisse = await getCaisseService(id);

    res.json(successResponse('Caisse récupérée', caisse));
  } catch (error: any) {
    res.status(404).json(errorResponse(error.message));
  }
};

export const openCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const caisse = await openCaisseService(id);

    res.json(successResponse('Caisse ouverte avec succès', caisse));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const closeCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const caisse = await closeCaisseService(id);

    res.json(successResponse('Caisse fermée avec succès', caisse));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const getCaissesByAgence: RequestHandler = async (req, res) => {
  try {
    const agence_id = req.params.agence_id as string;

    const caisses = await getCaissesByAgenceService(agence_id);

    res.json(successResponse('Caisses récupérées', caisses));

  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const updateCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const caisse = await updateCaisseService(id, req.body);

    res.json(successResponse('Caisse mise à jour', caisse));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const deleteCaisse: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    await deleteCaisseService(id);

    res.json(successResponse('Caisse désactivée'));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};