import type { Request, Response, NextFunction } from 'express';
import { User } from './models/user.model.js';
import { sessionService } from './session/session.service.js';
import { 
  CreateEmployeeRequestSchema, 
  UpdateEmployeeRequestSchema,
  type Role,
} from '@repo/contracts';
import mongoose from 'mongoose';

export class AdminController {
  public listEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = { role: 'employee' };
      if (req.query.isActive !== undefined) {
        query.isActive = req.query.isActive === 'true';
      }
      if (req.query.role) {
        const requestedRole = req.query.role as string;
        if (requestedRole === 'employee') {
          query.role = requestedRole;
        } else {
          query.role = { $in: [] }; // Enforce employee constraint by matching nothing
        }
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('_id name email avatarUrl isActive role createdAt updatedAt')
          .lean(),
        User.countDocuments(query),
      ]);

      const data = users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }));

      res.json({
        users: data,
        page,
        limit,
        total,
      });
    } catch (error) {
      next(error);
    }
  };

  public createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const bodyResult = CreateEmployeeRequestSchema.safeParse(req.body);
      if (!bodyResult.success) {
        res.status(400).json({ error: 'Invalid request', details: bodyResult.error.issues });
        return;
      }

      const { name, email, role } = bodyResult.data;

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ error: 'User with this email already exists. Use PATCH to update their role.' });
        return;
      }

      // We create the user identity. They will authenticate via OAuth which matches the email.
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        role,
        isActive: true,
      });

      res.status(201).json({
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        isActive: newUser.isActive,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  public updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const targetId = req.params.id as string;
      if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
        res.status(400).json({ error: 'Invalid or missing user ID' });
        return;
      }

      const bodyResult = UpdateEmployeeRequestSchema.safeParse(req.body);
      if (!bodyResult.success) {
        res.status(400).json({ error: 'Invalid request', details: bodyResult.error.issues });
        return;
      }

      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { name, isActive, role } = bodyResult.data;

      const adminRole = req.auth!.role as Role || 'user';
      const { ROLE_PERMISSIONS } = await import('./authorization/roles.js');
      const allowedPermissions = ROLE_PERMISSIONS[adminRole] || [];

      // Only allow admins with 'role:manage' to change roles
      if (role && role !== targetUser.role) {
        if (!allowedPermissions.includes('role:manage')) {
          res.status(403).json({ error: 'Insufficient permissions to manage roles' });
          return;
        }
      }

      const isDemoting = role && role !== 'admin';
      const isDeactivating = isActive === false;
      const requiresSessionRevoke = (isActive === false && targetUser.isActive) || (role !== undefined && targetUser.role !== role);
      
      let updatedUser;

      if (targetUser.role === 'admin' && targetUser.isActive && (isDemoting || isDeactivating)) {
        // Enforce last-active-admin atomically using a transaction
        const session = await mongoose.startSession();
        try {
          let transactionError: string | null = null;
          await session.withTransaction(async () => {
            const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true }).session(session);
            if (activeAdminCount <= 1) {
              transactionError = 'Cannot deactivate or demote the last active admin.';
              throw new Error('AbortTransaction');
            }
            
            if (name !== undefined) targetUser.name = name;
            if (isActive !== undefined) targetUser.isActive = isActive;
            if (role !== undefined) targetUser.role = role;
            
            updatedUser = await targetUser.save({ session });
          });
          if (transactionError) {
            res.status(400).json({ error: transactionError });
            return;
          }
        } catch (error: unknown) {
          if ((error as Error).message === 'AbortTransaction') {
            if (!res.headersSent) {
              res.status(400).json({ error: 'Cannot deactivate or demote the last active admin.' });
            }
            return;
          }
          throw error;
        } finally {
          await session.endSession();
        }
      } else {
        if (name !== undefined) targetUser.name = name;
        if (isActive !== undefined) targetUser.isActive = isActive;
        if (role !== undefined) targetUser.role = role;
        updatedUser = await targetUser.save();
      }

      if (requiresSessionRevoke) {
        await sessionService.revokeAllSessions(targetId);
      }

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      res.json({
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const adminController = new AdminController();
