'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { EarningsView } from '@/components/dashboard/earnings-view';

export default function EarningsPage() {
  return (
    <RoleGuard allowedRoles={['user']} fallbackUrl="/">
      <EarningsView />
    </RoleGuard>
  );
}
