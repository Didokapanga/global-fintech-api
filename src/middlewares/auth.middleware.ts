import jwt from 'jsonwebtoken';
import type {
  Request,
  Response,
  NextFunction
} from 'express';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'dev_secret_key';

/**
 * =========================================
 * AUTH REQUEST
 * =========================================
 */
export interface AuthRequest
  extends Request {
  user?: {
    id: string;
    role_id: string;
    role_name: string;
    agence_id: string;
  };
}

/**
 * =========================================
 * AUTH MIDDLEWARE
 * =========================================
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    /**
     * Authorization header
     */
    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith(
        'Bearer '
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          'Token manquant'
      });
    }

    /**
     * Bearer token
     */
    const token =
      authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          'Token invalide'
      });
    }

    /**
     * Verify JWT
     */
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      ) as {
        id: string;
        role_id: string;
        role_name: string;
        agence_id: string;
      };

    /**
     * Inject user
     */
    req.user = {
      id: decoded.id,
      role_id:
        decoded.role_id,
      role_name:
        decoded.role_name,
      agence_id:
        decoded.agence_id
    };

    return next();

  } catch (
    err: unknown
  ) {
    return res.status(401).json({
      success: false,
      message:
        'Token invalide ou expiré'
    });
  }
}