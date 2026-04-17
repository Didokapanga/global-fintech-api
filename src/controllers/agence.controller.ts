import type { RequestHandler } from 'express';
import {
  getAgencesService,
  getAgenceService,
  createAgenceService,
  deleteAgenceService,
  updateAgenceService
} from '../services/agence.service.js';

import { paginatedResponse } from '../utils/pagination.js';
import { errorResponse, successResponse } from '../utils/apiResponse.js';

export const getAgences: RequestHandler = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { data, total } = await getAgencesService(page, limit, offset);

    res.json(paginatedResponse(data, total, page, limit));
  } catch (error: any) {
    res.status(500).json(errorResponse(error.message));
  }
};

export const getAgence: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const agence = await getAgenceService(id);

    res.json(successResponse('Agence récupérée', agence));
  } catch (error: any) {
    res.status(404).json(errorResponse(error.message));
  }
};

export const createAgence: RequestHandler = async (req, res) => {
  try {
    const agence = await createAgenceService(req.body);

    res.json(successResponse('Agence créée avec succès', agence));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const updateAgence: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    const agence = await updateAgenceService(id, req.body);

    res.json(successResponse('Agence mise à jour', agence));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};

export const deleteAgence: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;

    await deleteAgenceService(id);

    res.json(successResponse('Agence désactivée avec succès'));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};