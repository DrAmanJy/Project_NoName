import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Creator Video',
  description: 'Submit original creator videos for automated verification and reward disbursement.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UploadVideoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
