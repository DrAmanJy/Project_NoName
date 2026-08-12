'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['user', 'employee', 'admin']} fallbackUrl="/">
      <DashboardView />
    </RoleGuard>
  );
}
