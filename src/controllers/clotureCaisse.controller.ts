import type { RequestHandler } from 'express';
import { clotureCaisseService } from '../services/clotureCaisse.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const clotureCaisse: RequestHandler = async (req, res) => {
  try {
    const result = await clotureCaisseService(req.body);

    res.json(successResponse(result.message, result.cloture));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};