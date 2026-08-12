'use client';

import Link from 'next/link';
import { RoleGuard } from '@/components/auth/role-guard';

export default function SubmissionsPage() {
  return (
    <RoleGuard allowedRoles={['user', 'employee', 'admin']} fallbackUrl="/">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <h1 className="text-4xl font-bold tracking-tight">My Submissions</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Manage your submitted videos.
        </p>
        <div className="mt-8">
          <Link 
            href="/dashboard/videos/upload" 
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition"
          >
            New Submission
          </Link>
        </div>
      </main>
    </RoleGuard>
  );
}
