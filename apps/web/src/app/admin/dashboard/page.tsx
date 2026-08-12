'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { VideoReviewConsole } from '@/components/admin/video-review/video-review-console';
import { EmployeeManagementConsole } from '@/components/admin/employees/employee-management-console';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Video, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'employees'>('videos');

  return (
    <RoleGuard allowedRoles={['admin', 'employee']} fallbackUrl="/dashboard">
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        {/* TOP SECTION SELECTOR BAR */}
        <div className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                Admin Oversight Portal
              </span>
            </div>

            {/* Segmented Control Switcher */}
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeTab === 'videos'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.02]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Video className="h-4 w-4 text-emerald-500" />
                <span>Videos Moderation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('employees')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  activeTab === 'employees'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.02]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Users className="h-4 w-4 text-blue-500" />
                <span>Employee Directory</span>
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE SECTION CONTENT */}
        {activeTab === 'videos' ? (
          <VideoReviewConsole />
        ) : (
          <div className="flex min-h-[calc(100vh-60px)] flex-col justify-between">
            <Navbar />
            <main className="flex-1 py-8 lg:py-10">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <EmployeeManagementConsole />
              </div>
            </main>
            <Footer />
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
