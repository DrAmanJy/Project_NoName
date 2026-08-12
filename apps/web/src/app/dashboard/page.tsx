import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const metadata: Metadata = {
  title: 'Creator Dashboard | Synax',
  description: 'View your uploaded videos, track verification and progress status, and monitor video earnings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardPage() {
  return <DashboardView />;
}
