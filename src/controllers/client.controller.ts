import type { RequestHandler } from 'express';
import {
  createClientService,
  getClientsService,
  getClientService,
  updateClientService,
  deleteClientService
} from '../services/client.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { paginatedResponse } from '../utils/pagination.js';

export const createClient: RequestHandler = async (req, res) => {
  try {
    const client = await createClientService(req.body);
    res.json(successResponse('Client créé', client));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const getClients: RequestHandler = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await getClientsService(page, limit, search);

    res.json(paginatedResponse(result.data, result.total, page, limit));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const getClient: RequestHandler = async (req, res) => {
  try {
    const client = await getClientService(req.params.id as string);
    res.json(successResponse('Client trouvé', client));
  } catch (err: any) {
    res.status(404).json(errorResponse(err.message));
  }
};

export const updateClient: RequestHandler = async (req, res) => {
  try {
    const client = await updateClientService(req.params.id as string, req.body);
    res.json(successResponse('Client mis à jour', client));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const deleteClient: RequestHandler = async (req, res) => {
  try {
    await deleteClientService(req.params.id as string);
    res.json(successResponse('Client supprimé'));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};