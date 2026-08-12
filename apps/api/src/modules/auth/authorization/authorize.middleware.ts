import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import type { Permission } from './permissions.js';
import { ROLE_PERMISSIONS } from './roles.js';

export const authorize = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.auth || !req.auth.userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await User.findById(req.auth.userId).lean();
      if (!user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const role = user.role || 'user';
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
