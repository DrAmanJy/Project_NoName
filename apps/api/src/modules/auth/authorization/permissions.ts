export const PERMISSIONS = [
  'submission:create',
  'submission:read:own',
  'submission:read',
  'submission:update',
  'submission:review',
  'video:upload:own',
  'video:read',
  'video:verify',
  'employee:create',
  'employee:read',
  'employee:update',
  'employee:deactivate',
  'role:manage',
] as const;

export type Permission = typeof PERMISSIONS[number];
