'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileVideo,
  RefreshCw,
  X,
  Zap,
  Users,
  Eye,
  Filter,
  UserCheck,
  UserX,
} from 'lucide-react';
import { staffApi, adminApi } from '@/lib/api-client';
import type { User } from '@repo/contracts';
import { RoleGuard } from '@/components/auth/role-guard';

interface VideoProgressStep {
  title: string;
  description: string;
  state: 'completed' | 'current' | 'pending' | 'rejected';
  timestamp?: string;
}

interface UserVideoSubmissionItem {
  id: string;
  title: string;
  creatorName: string;
  creatorEmail: string;
  creatorAvatar?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected' | 'payment_pending' | 'paid';
  statusLabel: string;
  uploadedAt: string;
  rewardAmount?: string;
  videoUrl?: string;
  steps: VideoProgressStep[];
  rejectionReason?: string;
}

export default function EmployeeDashboardPage() {
  const [activeTab, setActiveTab] = useState<'video-progress' | 'employees'>('video-progress');
  const [videoSubmissions, setVideoSubmissions] = useState<UserVideoSubmissionItem[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<UserVideoSubmissionItem | null>(null);



  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch live user video submissions from staff API
      const staffSubmissionsRes = await staffApi.submissions.list(1, 50).catch(() => null);
      if (staffSubmissionsRes && Array.isArray(staffSubmissionsRes.data) && staffSubmissionsRes.data.length > 0) {
        const mapped: UserVideoSubmissionItem[] = staffSubmissionsRes.data.map((item) => {
          let statusLabel = 'In Review';
          if (item.status === 'approved') statusLabel = 'Approved';
          if (item.status === 'paid') statusLabel = 'Approved & Paid';
          if (item.status === 'rejected') statusLabel = 'Rejected';
          if (item.status === 'payment_pending') statusLabel = 'Payment Pending';
          if (item.status === 'draft') statusLabel = 'Draft';

          const mappedSteps: VideoProgressStep[] = item.timeline && item.timeline.length > 0
            ? item.timeline.map((step) => ({
                title:
                  step.key === 'video_uploaded'
                    ? 'Video Uploaded'
                    : step.key === 'under_review'
                    ? 'Quality & Guideline Review'
                    : 'Payout Approval',
                description: step.message || 'Timeline step status updated',
                state: step.status as 'completed' | 'current' | 'pending' | 'rejected',
                timestamp: step.completedAt ? new Date(step.completedAt).toLocaleString() : undefined,
              }))
            : [
                {
                  title: 'Video Uploaded',
                  description: 'Upload verified',
                  state: 'completed',
                  timestamp: new Date(item.createdAt).toLocaleString(),
                },
                {
                  title: 'Quality & Guideline Review',
                  description: 'Reviewing against platform guidelines',
                  state: item.status === 'in_review' ? 'current' : item.status === 'rejected' ? 'rejected' : 'completed',
                },
                {
                  title: 'Payout Approval',
                  description: 'Reward disbursement status',
                  state: item.status === 'paid' ? 'completed' : 'pending',
                },
              ];

          return {
            id: item.id,
            title: `Submission #${item.id.slice(-6)}`,
            creatorName: item.user?.name || 'Creator User',
            creatorEmail: item.user?.email || 'user@example.com',
            creatorAvatar: item.user?.avatarUrl,
            status: item.status as UserVideoSubmissionItem['status'],
            statusLabel,
            uploadedAt: new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            rewardAmount: item.earning != null ? `₹${(item.earning / 100).toFixed(2)}` : undefined,
            videoUrl: item.video?.previewUrl,
            steps: mappedSteps,
          };
        });
        setVideoSubmissions(mapped);
      } else {
        setVideoSubmissions([]);
      }

      // 2. Fetch employee list from admin API
      const employeesRes = await adminApi.employees.list(1, 50).catch(() => null);
      if (employeesRes && Array.isArray(employeesRes.users)) {
        setEmployees(employeesRes.users);
      } else {
        setEmployees([]);
      }
    } catch {
      setVideoSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Filter video submissions
  const filteredSubmissions = videoSubmissions.filter((item) => {
    const matchesFilter =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'IN_REVIEW' && (item.status === 'in_review' || item.status === 'draft')) ||
      (selectedStatusFilter === 'APPROVED' && item.status === 'approved') ||
      (selectedStatusFilter === 'PAID' && (item.status === 'paid' || item.status === 'payment_pending')) ||
      (selectedStatusFilter === 'REJECTED' && item.status === 'rejected');

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creatorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // KPI Calculations
  const totalCount = videoSubmissions.length;
  const inReviewCount = videoSubmissions.filter((v) => v.status === 'in_review' || v.status === 'draft').length;
  const paidCount = videoSubmissions.filter((v) => v.status === 'paid' || v.status === 'approved').length;
  const rejectedCount = videoSubmissions.filter((v) => v.status === 'rejected').length;

  return (
    <RoleGuard allowedRoles={['admin', 'employee']} fallbackUrl="/dashboard">
      <div className="relative min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 p-6 lg:p-10 transition-colors duration-300 overflow-hidden">
        {/* Background Ambient Glow Accents */}
        <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5" />
        <div className="pointer-events-none absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />

        <div className="relative mx-auto max-w-7xl">
          {/* Header Title & Navigation Tabs */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900/80 px-3.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-300 mb-2 border border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-inner">
                <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                <span>Admin & Staff Oversight Portal</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                User Video Progress & Employee Dashboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                Monitor real-time user video submission timelines, verification progress, and manage staff employees.
              </p>
            </div>

            {/* Tab Switcher Pills */}
            <div className="flex items-center gap-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-1.5 shadow-sm backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab('video-progress')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  activeTab === 'video-progress'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md ring-1 ring-zinc-700/50'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900'
                }`}
                id="admin-tab-video-progress"
              >
                <Video className="h-4 w-4" />
                <span>User Video Progress</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('employees')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  activeTab === 'employees'
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md ring-1 ring-zinc-700/50'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900'
                }`}
                id="admin-tab-employees"
              >
                <Users className="h-4 w-4" />
                <span>Manage Employees ({employees.length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: User Video Progress Monitor */}
          {activeTab === 'video-progress' && (
            <div className="mt-8 space-y-8 animate-in fade-in duration-300">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Total User Submissions */}
                <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      USER SUBMISSIONS
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <FileVideo className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {totalCount}
                  </div>
                  <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 block">
                    Total user videos tracked
                  </span>
                </div>

                {/* Card 2: In Review */}
                <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      IN QUALITY REVIEW
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                    {inReviewCount}
                  </div>
                  <span className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span>Requires moderation</span>
                  </span>
                </div>

                {/* Card 3: Approved & Paid */}
                <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      APPROVED & PAID
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {paidCount}
                  </div>
                  <span className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    <span>Payouts completed</span>
                  </span>
                </div>

                {/* Card 4: Rejected Submissions */}
                <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-red-400/50 dark:hover:border-red-500/50 hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      REJECTED SUBMISSIONS
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-extrabold text-red-600 dark:text-red-400">
                    {rejectedCount}
                  </div>
                  <span className="mt-1 text-xs text-red-500 dark:text-red-400 block">
                    Non-compliant videos
                  </span>
                </div>
              </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, creator email, title or submission ID..."
                  className="h-10 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  id="admin-search-input"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="h-4 w-4 text-zinc-400 shrink-0" />
                {(['ALL', 'IN_REVIEW', 'APPROVED', 'PAID', 'REJECTED'] as const).map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setSelectedStatusFilter(statusKey)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedStatusFilter === statusKey
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                    id={`filter-pill-${statusKey}`}
                  >
                    {statusKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* User Video Submissions Progress Cards List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
                <span className="ml-2 text-sm text-zinc-500">Loading user video progress...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => {
                  const isPaid = submission.status === 'paid' || submission.status === 'payment_pending';
                  const isInReview = submission.status === 'in_review' || submission.status === 'draft';
                  const isApproved = submission.status === 'approved';
                  const isRejected = submission.status === 'rejected';

                  return (
                    <div
                      key={submission.id}
                      className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        {/* Creator Info & Video Title */}
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-base shadow-sm">
                            {submission.creatorName.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                                {submission.title}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                                  isPaid || isApproved
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : isInReview
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}
                              >
                                {isInReview && <Clock className="h-3 w-3" />}
                                {(isPaid || isApproved) && <CheckCircle2 className="h-3 w-3" />}
                                {isRejected && <AlertCircle className="h-3 w-3" />}
                                <span>{submission.statusLabel}</span>
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{submission.creatorName}</span>
                              <span>•</span>
                              <span>{submission.creatorEmail}</span>
                              <span>•</span>
                              <span>Uploaded: {submission.uploadedAt}</span>
                            </p>

                            {isRejected && submission.rejectionReason && (
                              <div className="mt-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-2.5 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
                                <span className="font-bold">Rejection Reason: </span>
                                {submission.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(submission)}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            id={`inspect-submission-btn-${submission.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Audit Video Timeline</span>
                          </button>
                        </div>
                      </div>

                      {/* Video Progress Steps Bar */}
                      <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {submission.steps.map((step, idx) => {
                            const isCompleted = step.state === 'completed';
                            const isCurrent = step.state === 'current';
                            const isStepRejected = step.state === 'rejected';

                            return (
                              <div
                                key={idx}
                                className={`flex items-start gap-3 rounded-xl p-3 border transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/30'
                                    : isCurrent
                                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/30'
                                    : isStepRejected
                                    ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/30'
                                    : 'bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/40 dark:border-zinc-800/40'
                                }`}
                              >
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isCompleted
                                      ? 'bg-emerald-600 text-white'
                                      : isCurrent
                                      ? 'bg-amber-600 text-white'
                                      : isStepRejected
                                      ? 'bg-red-600 text-white'
                                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : isCurrent ? (
                                    <Clock className="h-3.5 w-3.5" />
                                  ) : isStepRejected ? (
                                    <X className="h-3.5 w-3.5" />
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-xs font-bold truncate ${
                                      isCompleted
                                        ? 'text-emerald-900 dark:text-emerald-300'
                                        : isCurrent
                                        ? 'text-amber-900 dark:text-amber-300'
                                        : isStepRejected
                                        ? 'text-red-900 dark:text-red-300'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                                  >
                                    {step.title}
                                  </p>
                                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                    {step.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredSubmissions.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-zinc-400" />
                    <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                      No matching user videos found
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Try resetting your search query or status filter.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Employee Roster Management */}
        {activeTab === 'employees' && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Staff & Employee Directory
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Manage active employees and administrative team permissions.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Employee Name</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-900 dark:text-white">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold">
                            {emp.name.charAt(0)}
                          </div>
                          <span>{emp.name}</span>
                        </td>
                        <td className="py-4 px-6 text-zinc-600 dark:text-zinc-400">{emp.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              emp.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            {emp.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              emp.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                            }`}
                          >
                            {emp.isActive ? <UserCheck className="h-3.5 w-3.5" /> : <UserX className="h-3.5 w-3.5" />}
                            <span>{emp.isActive ? 'Active' : 'Deactivated'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-zinc-500">
                          {new Date(emp.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Video Audit Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    Video Progress Audit Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  id="close-admin-modal-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
                {/* HTML5 Video Player */}
                {selectedSubmission.videoUrl && (
                  <div className="relative overflow-hidden rounded-2xl bg-black border border-zinc-200 dark:border-zinc-800 shadow-md">
                    <video
                      controls
                      autoPlay
                      playsInline
                      controlsList="nodownload"
                      src={selectedSubmission.videoUrl}
                      className="w-full aspect-video rounded-2xl object-contain bg-black"
                    >
                      Your browser does not support HTML5 video playback.
                    </video>
                  </div>
                )}

                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedSubmission.title}
                  </h4>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="font-semibold text-zinc-400 block">Creator</span>
                      <span>{selectedSubmission.creatorName} ({selectedSubmission.creatorEmail})</span>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-400 block">Submission ID</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100">{selectedSubmission.id}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-400 block">Upload Date</span>
                      <span>{selectedSubmission.uploadedAt}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-400 block">Target Reward</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedSubmission.rewardAmount || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pl-2 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Complete Progress Audit Timeline
                  </h5>
                  {selectedSubmission.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          step.state === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : step.state === 'current'
                            ? 'bg-amber-600 text-white'
                            : step.state === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {step.state === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                        {step.state === 'current' && <Clock className="h-4 w-4" />}
                        {step.state === 'rejected' && <X className="h-4 w-4" />}
                        {step.state === 'pending' && idx + 1}
                      </div>
                      <div>
                        <h6 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {step.title}
                        </h6>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <span className="mt-1 block font-mono text-[10px] text-zinc-400">
                            {step.timestamp}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-2 text-xs font-bold shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100"
                >
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </RoleGuard>
);
}
