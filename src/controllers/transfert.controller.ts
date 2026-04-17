import type { RequestHandler } from 'express';
import { transfertCaisseService } from '../services/transfert.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const transfertCaisse: RequestHandler = async (req, res) => {
  try {
    const result = await transfertCaisseService(req.body);

    res.json(successResponse('Transfert effectué avec succès', result));
  } catch (error: any) {
    res.status(400).json(errorResponse(error.message));
  }
};
