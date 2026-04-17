import type { RequestHandler } from 'express';
import { retraitService } from '../services/retrait.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const retrait: RequestHandler = async (req, res) => {
  
  try {
    const result = await retraitService({
      ...req.body,
      created_by: req.body.created_by // ou token plus tard
    });

    res.json(successResponse(result.message, result));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};
