'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { RoleGuard } from '@/components/auth/role-guard';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function DashboardPage() {
  const router = useRouter();
  const { role, isLoading, isAuthenticated } = useAuth();



  return (
    <RoleGuard allowedRoles={['user']} fallbackUrl="/">
      <DashboardView />
    </RoleGuard>
  );
}
