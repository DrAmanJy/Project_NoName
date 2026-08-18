import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submissions Dashboard',
  description: 'Manage video submissions, track quality verification progress, and review earnings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubmissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
