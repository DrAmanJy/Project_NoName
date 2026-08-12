import { Router } from 'express';
import { requireAuth } from './auth.middleware.js';
import { authorize } from './authorization/authorize.middleware.js';
import { adminController } from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.get(
  '/employees',
  requireAuth,
  authorize('employee:read'),
  adminController.listEmployees
);

adminRoutes.post(
  '/employees',
  requireAuth,
  authorize('employee:create'),
  adminController.createEmployee
);

adminRoutes.patch(
  '/employees/:id',
  requireAuth,
  authorize('employee:update'),
  adminController.updateEmployee
);
