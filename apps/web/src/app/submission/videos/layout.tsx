import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Videos',
  description: 'View and manage your video content uploads.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SubmissionVideosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
