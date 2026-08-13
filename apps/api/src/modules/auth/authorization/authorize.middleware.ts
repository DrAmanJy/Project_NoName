import type { Request, Response, NextFunction } from 'express';
import type { Permission } from './permissions.js';
import { ROLE_PERMISSIONS } from './roles.js';

export const authorize = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth || !req.auth.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const role = req.auth.role as keyof typeof ROLE_PERMISSIONS || 'user';
      const allowedPermissions = ROLE_PERMISSIONS[role] || [];

      if (!allowedPermissions.includes(permission)) {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
