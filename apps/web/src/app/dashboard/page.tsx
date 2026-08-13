'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { RoleGuard } from '@/components/auth/role-guard';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export default function DashboardPage() {
  const router = useRouter();
  const { role, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (role === 'employee') {
        router.push('/employees/dashboard');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <RoleGuard allowedRoles={['user', 'employee', 'admin']} fallbackUrl="/">
      <DashboardView />
    </RoleGuard>
  );
}
