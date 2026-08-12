import { Router } from 'express';
import { requireAuth } from '../auth/auth.middleware.js';
import { authorize } from '../auth/authorization/authorize.middleware.js';
import { staffSubmissionsController } from './staff.controller.js';

export const staffSubmissionsRoutes = Router();

staffSubmissionsRoutes.get(
  '/',
  requireAuth,
  authorize('submission:read'),
  staffSubmissionsController.list
);

staffSubmissionsRoutes.get(
  '/:id',
  requireAuth,
  authorize('submission:read'),
  staffSubmissionsController.get
);

staffSubmissionsRoutes.patch(
  '/:id/status',
  requireAuth,
  authorize('submission:update'),
  staffSubmissionsController.updateStatus
);
