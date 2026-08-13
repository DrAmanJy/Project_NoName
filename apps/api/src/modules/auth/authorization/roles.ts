import type { Permission } from './permissions.js';

// We import Role from contracts for consistency
import type { Role } from '@repo/contracts';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  user: [
    'submission:create',
    'submission:read:own',
    'video:upload:own',
  ],
  employee: [
    'submission:read',
    'submission:update',
    'submission:review',
    'video:read',
    'video:verify',
  ],
  admin: [
    'submission:read',
    'submission:update',
    'submission:review',
    'submission:transition_any',
    'video:read',
    'video:verify',
    'employee:create',
    'employee:read',
    'employee:update',
    'employee:deactivate',
    'role:manage',
  ],
};
