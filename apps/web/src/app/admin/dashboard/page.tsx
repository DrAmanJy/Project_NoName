'use client';

import { useState } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { VideoReviewConsole } from '@/components/admin/video-review/video-review-console';
import { EmployeeManagementConsole } from '@/components/admin/employees/employee-management-console';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Video, Users, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'employees'>('videos');

  return (
    <RoleGuard allowedRoles={['admin', 'employee']} fallbackUrl="/dashboard">
      <div className="flex min-h-screen flex-col bg-[#FEFEFE] dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        {/* Main Sticky Navbar */}
        <Navbar />

        {/* ADMIN OVERSIGHT PORTAL HEADER WITH MARGIN & PADDING */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE] dark:bg-black pt-8 pb-6 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-300 mb-2.5 border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Admin Oversight Portal</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                {activeTab === 'videos' ? 'Video Moderation & Verification' : 'Employee Management Directory'}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {activeTab === 'videos'
                  ? 'Review creator submissions, inspect video quality, approve rewards, or issue rejection feedback.'
                  : 'Manage employee permissions, track active staff, and oversee platform administration.'}
              </p>
            </div>

            {/* Segmented Control Switcher */}
            <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
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
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all ${
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
        <main className="flex-1 py-8 lg:py-10">
          {activeTab === 'videos' ? (
            <VideoReviewConsole showNavbar={false} showHeaderBanner={false} />
          ) : (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <EmployeeManagementConsole />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
