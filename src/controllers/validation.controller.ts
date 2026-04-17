import type { RequestHandler } from 'express';
import { validateOperationService } from '../services/validation.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const validateOperation: RequestHandler = async (req, res) => {
  try {
    const result = await validateOperationService(req.body);

    res.json(successResponse(result.message, result));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};