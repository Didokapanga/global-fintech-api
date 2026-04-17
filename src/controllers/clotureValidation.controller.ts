import type { RequestHandler } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { validateClotureService } from '../services/clotureCaisse.service.js';

export const validateCloture: RequestHandler = async (req, res) => {
  try {
    const result = await validateClotureService(req.body);

    res.json(successResponse(result.message, result.cloture));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};