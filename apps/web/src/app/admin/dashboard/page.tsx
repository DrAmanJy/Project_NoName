'use client';

import { useState, useEffect } from 'react';
import { RoleGuard } from '@/components/auth/role-guard';
import { VideoReviewConsole } from '@/components/admin/video-review/video-review-console';
import { EmployeeManagementConsole } from '@/components/admin/employees/employee-management-console';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';  
import { Video, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'videos' | 'employees'>('videos');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Force active tab to videos if an employee somehow has 'employees' selected
  useEffect(() => {
    if (user && !isAdmin && activeTab === 'employees') {
      setActiveTab('videos');
    }
  }, [user, isAdmin, activeTab]);

  return (
    <RoleGuard allowedRoles={['admin', 'employee']} fallbackUrl="/dashboard">
      <div className="flex min-h-screen flex-col bg-[#FEFEFE] dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        {/* Main Sticky Navbar */}
        <Navbar />

        {/* ADMIN OVERSIGHT PORTAL HEADER WITH MARGIN & PADDING */}
        <div className="relative border-b border-zinc-200/80 dark:border-zinc-800/80 bg-[#FEFEFE] dark:bg-black pt-10 sm:pt-12 pb-8 transition-colors duration-300">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute -top-20 right-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/5" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>

              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                {activeTab === 'videos' ? 'Video Moderation & Verification' : 'Employee Management Directory'}
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                {activeTab === 'videos'
                  ? 'Review creator submissions, inspect video quality, approve rewards, or issue rejection feedback.'
                  : 'Manage employee permissions, track active staff, and oversee platform administration.'}
              </p>
            </div>

            {/* Segmented Control Switcher */}
            <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/90 p-1.5 border border-zinc-200 dark:border-zinc-800 shadow-sm backdrop-blur-md shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('videos')}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.01]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                id="admin-tab-videos-btn"
              >
                <Video className="h-4 w-4 text-emerald-500" />
                <span>Videos Moderation</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('employees')}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-200 ${
                    activeTab === 'employees'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-[1.01]'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  id="admin-tab-employees-btn"
                >
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Employee Directory</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE SECTION CONTENT WITH AMPLE TOP MARGIN */}
        <main className="flex-1 pt-8 pb-12 lg:pt-10 lg:pb-16">
          {activeTab === 'videos' ? (
            <VideoReviewConsole showNavbar={false} showHeaderBanner={false} />
          ) : (
            isAdmin ? (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <EmployeeManagementConsole />
              </div>
            ) : null
          )}
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
