import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const token = authHeader.split(' ')[1];

    // 🔥 FIX CRITIQUE
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('DECODED =>', decoded);

    req.user = {
      id: decoded.id,
      role_id: decoded.role_id,
      role_name: decoded.role_name,
      agence_id: decoded.agence_id
    };
    console.log('REQ.USER =>', req.user);

    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    });
  }
}
