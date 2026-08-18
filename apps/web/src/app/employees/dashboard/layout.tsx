import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Moderation Portal',
  description: 'Review submission timelines, verify creator videos, and process moderation tasks.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
