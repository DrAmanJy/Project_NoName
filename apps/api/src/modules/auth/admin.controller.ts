import type { Request, Response } from 'express';
import { User } from './models/user.model.js';
import { sessionService } from './session/session.service.js';
import { 
  CreateEmployeeRequestSchema, 
  UpdateEmployeeRequestSchema 
} from '@repo/contracts';
import mongoose from 'mongoose';

export class AdminController {
  public listEmployees = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      const query: Record<string, unknown> = { role: { $in: ['employee', 'admin'] } };
      if (req.query.isActive !== undefined) {
        query.isActive = req.query.isActive === 'true';
      }
      if (req.query.role) {
        query.role = req.query.role;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
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
      console.error('List employees error:', error);
      res.status(500).json({ error: 'Failed to list employees' });
    }
  };

  public createEmployee = async (req: Request, res: Response): Promise<void> => {
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
      console.error('Create employee error:', error);
      res.status(500).json({ error: 'Failed to create employee' });
    }
  };

  public updateEmployee = async (req: Request, res: Response): Promise<void> => {
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

      const adminUser = await User.findById(req.auth!.userId as string).lean();
      
      const { name, isActive, role } = bodyResult.data;

      // Only allow admins with 'role:manage' to change roles
      if (role && role !== targetUser.role) {
        if (!adminUser || adminUser.role !== 'admin') {
          res.status(403).json({ error: 'Insufficient permissions to manage roles' });
          return;
        }
      }

      // Prevent demotion/deactivation of the last active admin
      if (targetUser.role === 'admin' && targetUser.isActive) {
        const isDemoting = role && role !== 'admin';
        const isDeactivating = isActive === false;

        if (isDemoting || isDeactivating) {
          const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
          if (activeAdminCount <= 1) {
            res.status(400).json({ error: 'Cannot deactivate or demote the last active admin.' });
            return;
          }
        }
      }

      let requiresSessionRevoke = false;

      if (name !== undefined) targetUser.name = name;
      if (isActive !== undefined) {
        if (targetUser.isActive && !isActive) {
          requiresSessionRevoke = true;
        }
        targetUser.isActive = isActive;
      }
      if (role !== undefined) {
        if (targetUser.role !== role) {
          requiresSessionRevoke = true;
        }
        targetUser.role = role;
      }

      await targetUser.save();

      if (requiresSessionRevoke) {
        await sessionService.revokeAllSessions(targetId);
      }

      res.json({
        id: targetUser._id.toString(),
        name: targetUser.name,
        email: targetUser.email,
        isActive: targetUser.isActive,
        role: targetUser.role,
        createdAt: targetUser.createdAt.toISOString(),
        updatedAt: targetUser.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  };
}

export const adminController = new AdminController();
