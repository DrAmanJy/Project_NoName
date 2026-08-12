'use client';

import { RoleGuard } from '@/components/auth/role-guard';
import { VideoReviewConsole } from '@/components/admin/video-review/video-review-console';

export default function AdminVideosPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'employee']} fallbackUrl="/dashboard">
      <VideoReviewConsole />
    </RoleGuard>
  );
}
