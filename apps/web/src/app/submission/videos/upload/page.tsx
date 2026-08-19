'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VideoUploader } from '@/components/video/VideoUploader';
import { RoleGuard } from '@/components/auth/role-guard';

export default function UploadVideoPage() {
  return (
    <RoleGuard allowedRoles={['user']} fallbackUrl="/">
      <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        <Navbar />

        <main className="flex-1 py-6 sm:py-8 lg:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Back Navigation Bar */}
            <div className="mb-4 sm:mb-6">
              <Link
                href="/submission"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3.5 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors active:scale-95"
                id="upload-page-back-to-dashboard-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>

            {/* Header Title Banner */}
            <div className="border-b border-zinc-200 dark:border-zinc-900 pb-5 sm:pb-6 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Upload Creator Video
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Submit your experience videos directly to object storage for fast processing and automated verification review.
              </p>
            </div>

            {/* Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Guidelines Sidebar (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                {/* Guidelines Box */}
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-4">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Quality Guidelines</span>
                  </div>

                  <ul className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">Minimum 1080p Resolution</span>
                        <span>High definition video ensures faster verification approval.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">Supported Formats</span>
                        <span>MP4, MOV, or WEBM files up to 100 MB.</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-white block">Original Content Only</span>
                        <span>Ensure your submission complies with platform guidelines.</span>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Earnings Info Callout */}
                <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-950 p-5 sm:p-6 text-white shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Creator Earnings</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Earn Up to $100.00 Per Approved Video
                  </h4>
                  <p className="mt-1 text-xs text-zinc-400">
                    Once your video passes verification review, funds will be directly credited to your creator balance.
                  </p>
                </div>
              </div>

              {/* Right Column: Video Uploader Component (8 cols on lg) */}
              <div className="lg:col-span-8 order-1 lg:order-2">
                <VideoUploader />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </RoleGuard>
  );
}
