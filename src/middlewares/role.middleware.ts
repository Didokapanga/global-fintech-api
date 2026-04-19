import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.middleware.js';

export function roleGuard(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      if (!user.role_name) {
        return res.status(403).json({
          success: false,
          message: 'Rôle utilisateur introuvable'
        });
      }

      if (!allowedRoles.includes(user.role_name)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé'
        });
      }

      next();

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  };
}