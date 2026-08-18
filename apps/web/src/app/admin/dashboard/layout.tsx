import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Moderation & Staff Portal',
  description: 'Manage creator video reviews, oversee staff permissions, and monitor platform operations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
