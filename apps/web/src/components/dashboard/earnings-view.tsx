'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Settings,
  Video,
  Check,
  MoreHorizontal,
  X,
  AlertTriangle,
  Upload,
  Search,
  DollarSign,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { earningsApi, submissionsApi } from '@/lib/api-client';
import type { VideoStatus } from '@repo/contracts';

interface SubmissionItem {
  id: string;
  fileName: string;
  fileSize: string;
  date: string;
  status: VideoStatus;
  statusText: string;
  estimatedReward: string;
  steps: {
    title: string;
    description: string;
    state: 'completed' | 'current' | 'pending' | 'rejected';
  }[];
}

interface SummaryData {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  currency: string;
}

export function EarningsView() {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    currency: 'USD',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEarningsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, submissionsRes] = await Promise.all([
        earningsApi.summary().catch(() => null),
        submissionsApi.list(1, 50).catch(() => null),
      ]);

      if (summaryRes) {
        setSummary({
          totalEarnings: summaryRes.totalEarnings || 0,
          pendingEarnings: summaryRes.pendingEarnings || 0,
          paidEarnings: summaryRes.paidEarnings || 0,
          currency: summaryRes.currency || 'USD',
        });
      } else {
        setSummary({
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          currency: 'USD',
        });
      }

      if (submissionsRes && Array.isArray(submissionsRes.data) && submissionsRes.data.length > 0) {
        const mapped: SubmissionItem[] = submissionsRes.data.map((item) => {
          let status: VideoStatus = 'UNDER_REVIEW';
          let statusText = 'In Review';
          if (item.status === 'approved' || item.status === 'paid') {
            status = 'PAID';
            statusText = 'Approved & Paid';
          } else if (item.status === 'rejected') {
            status = 'REJECTED';
            statusText = 'Rejected';
          } else if (item.status === 'draft') {
            status = 'PROCESSING';
            statusText = 'Processing';
          }

          const steps =
            item.timeline && item.timeline.length > 0
              ? item.timeline.map((step) => ({
                  title:
                    step.key === 'video_uploaded'
                      ? 'Video Uploaded'
                      : step.key === 'under_review'
                      ? 'Under Review'
                      : 'Payment',
                  description: step.message || 'Timeline step completed',
                  state: step.status as 'completed' | 'current' | 'pending' | 'rejected',
                }))
              : [
                  {
                    title: 'Video Uploaded',
                    description: 'Received & verified',
                    state: 'completed' as const,
                  },
                  {
                    title: 'Under Review',
                    description: 'Checking content guidelines',
                    state:
                      item.status === 'in_review'
                        ? ('current' as const)
                        : item.status === 'rejected'
                        ? ('rejected' as const)
                        : ('completed' as const),
                  },
                  {
                    title: 'Payment',
                    description: item.status === 'paid' ? 'Paid to wallet' : 'Pending review approval',
                    state: item.status === 'paid' ? ('completed' as const) : ('pending' as const),
                  },
                ];

          return {
            id: item.id,
            fileName: `submission_${item.id.slice(-6)}.mp4`,
            fileSize: '120 MB',
            date: new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            status,
            statusText,
            estimatedReward: item.status === 'paid' || item.status === 'approved' ? '$50.00' : '$0.00',
            steps,
          };
        });
        setSubmissions(mapped);
      } else {
        setSubmissions([]);
      }
    } catch {
      setSubmissions([]);
      setSummary({
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
        currency: 'USD',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'IN_REVIEW' && (sub.status === 'UNDER_REVIEW' || sub.status === 'PROCESSING')) ||
      (selectedFilter === 'REJECTED' && sub.status === 'REJECTED') ||
      (selectedFilter === 'PAID' && sub.status === 'PAID');

    const matchesSearch =
      sub.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Page Header Banner */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-900 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-300 mb-2 border border-zinc-200 dark:border-zinc-800">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Creator Earnings & Status</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Earnings & Submissions
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Track your video rewards, submission review status, and payout histories in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/videos/upload"
                className="group flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-lg"
                id="earnings-upload-btn"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New Video</span>
              </Link>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Settings"
                id="web-earnings-settings-btn"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Web Summary Metrics Cards Grid (4 Columns) */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Earnings */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  TOTAL EARNINGS
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                ${summary.totalEarnings.toFixed(2)}
              </div>
              <div className="mt-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Lifetime calculated rewards
              </div>
            </div>

            {/* Card 2: Total Paid Out */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  TOTAL PAID OUT
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                ${summary.paidEarnings.toFixed(2)}
              </div>
              <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Direct wallet payouts</span>
              </div>
            </div>

            {/* Card 3: Pending Earnings */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  PENDING EARNINGS
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                ${summary.pendingEarnings.toFixed(2)}
              </div>
              <div className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
                Awaiting review completion
              </div>
            </div>

            {/* Card 4: Total Submissions */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  SUBMISSIONS
                </p>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {submissions.length}
              </div>
              <div className="mt-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Uploaded video submissions
              </div>
            </div>
          </div>

          {/* Section 2 Workspace: Submissions Header & Controls */}
          <div className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  My Submissions & Payout Status
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Detailed timeline and status for all submitted experience videos.
                </p>
              </div>

              {/* Controls: Search & Filter Tabs */}
              {submissions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search Bar */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search submissions..."
                      className="h-10 w-full sm:w-60 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white"
                      id="submission-search-input"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1">
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('ALL')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'ALL'
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('IN_REVIEW')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'IN_REVIEW'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      In Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('PAID')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'PAID'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('REJECTED')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'REJECTED'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Submissions Grid / Loading / Empty State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <RefreshCw className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Loading earnings and submission history...
                </p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 sm:p-16 text-center bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 mb-4">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No earnings or submissions yet
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  You don&apos;t have any video earnings or submissions recorded yet. Upload your videos to start earning rewards.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/videos/upload"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-bold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02]"
                    id="earnings-empty-upload-btn"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload New Video</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredSubmissions.map((item) => {
                  const isRejected = item.status === 'REJECTED';
                  const isInReview = item.status === 'UNDER_REVIEW' || item.status === 'PROCESSING';

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-md transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
                    >
                      <div>
                        {/* Submission Header Row */}
                        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ${
                                isRejected
                                  ? 'bg-red-500'
                                  : isInReview
                                  ? 'bg-amber-600'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {isRejected ? (
                                <AlertTriangle className="h-6 w-6" />
                              ) : isInReview ? (
                                <Video className="h-6 w-6" />
                              ) : (
                                <Check className="h-6 w-6" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                  Submission - {item.date}
                                </h3>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                    isRejected
                                      ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                                      : isInReview
                                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
                                      : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                >
                                  {item.statusText}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500 flex items-center gap-2">
                                <span>{item.fileName}</span>
                                <span>•</span>
                                <span>{item.fileSize}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Reward
                            </div>
                            <div className="text-lg font-extrabold text-zinc-900 dark:text-white">
                              {item.estimatedReward}
                            </div>
                          </div>
                        </div>

                        {/* Stepper Timeline Section */}
                        <div className="mt-6 pl-2">
                          {item.steps.map((step, idx) => {
                            const isLast = idx === item.steps.length - 1;

                            return (
                              <div key={idx} className="relative flex gap-4 pb-5 last:pb-0">
                                {!isLast && (
                                  <span
                                    className="absolute top-6 left-3 -ml-[1px] h-full w-[2px] bg-zinc-200 dark:bg-zinc-800"
                                    aria-hidden="true"
                                  />
                                )}

                                <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white">
                                  {step.state === 'completed' && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    </div>
                                  )}
                                  {step.state === 'current' && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </div>
                                  )}
                                  {step.state === 'rejected' && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                                      <X className="h-3.5 w-3.5 stroke-[3]" />
                                    </div>
                                  )}
                                  {step.state === 'pending' && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400">
                                      <Wallet className="h-3.5 w-3.5" />
                                    </div>
                                  )}
                                </div>

                                <div className="-mt-0.5">
                                  <h4
                                    className={`text-sm font-bold ${
                                      step.state === 'pending'
                                        ? 'text-zinc-400'
                                        : 'text-zinc-900 dark:text-white'
                                    }`}
                                  >
                                    {step.title}
                                  </h4>
                                  <p
                                    className={`text-xs ${
                                      step.state === 'pending'
                                        ? 'text-zinc-400'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-6 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-900 pt-4 text-xs font-semibold">
                        <span className="text-zinc-400">ID: {item.id}</span>
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-1 text-zinc-900 dark:text-white hover:underline"
                        >
                          <span>View Details</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoading && submissions.length > 0 && filteredSubmissions.length === 0 && (
              <div className="mt-8 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
                <Video className="mx-auto h-12 w-12 text-zinc-400" />
                <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                  No submissions found
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Try adjusting your search query or filter selection.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
