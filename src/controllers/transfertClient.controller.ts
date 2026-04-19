import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import { createTransfertClientService } from "../services/transfertClient.service.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const createTransfertClient = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json(errorResponse('Utilisateur non authentifié'));
    }

    const result = await createTransfertClientService({
      ...req.body,

      // 🔐 injecté automatiquement
      created_by: user.id,

      // 🌐 audit
      ip: req.ip,
      user_agent: req.headers['user-agent']
    });

    res.json(successResponse('Transfert créé avec succès', result));

  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};