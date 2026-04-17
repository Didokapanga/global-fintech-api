import type { RequestHandler } from "express";
import { createTransfertClientService } from "../services/transfertClient.service.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const createTransfertClient: RequestHandler = async (req, res) => {
  try {
    const result = await createTransfertClientService(req.body);

    res.json(successResponse('Transfert créé avec succès', result));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};