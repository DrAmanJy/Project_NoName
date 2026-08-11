import type { Metadata } from 'next';
import { VideoReviewConsole } from '@/components/admin/video-review/video-review-console';

export const metadata: Metadata = {
  title: 'Video Review Console - Admin',
  description: 'Internal admin panel for reviewing, approving, and rejecting video submissions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminVideosPage() {
  return <VideoReviewConsole />;
}
