'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  ArrowUpDown,
  FileX2,
  Info,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Loader2,
  ChevronDown,
  Play,
} from 'lucide-react';
import { type VideoStatus, type VideoVerificationStatus } from '@repo/contracts';
import { VideoPlayer } from './video-player';
import { ReviewModal, type ReviewActionType } from './review-modal';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VideoMetadata } from './video-metadata';
import { staffApi } from '@/lib/api-client';

export interface AdminVideoUser {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminVideoInfo {
  id: string;
  originalFilename: string;
  previewUrl?: string | null;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number | null;
  height?: number | null;
  width?: number | null;
  thumbnailUrl?: string | null;
  uploadStatus?: string;
  uploadedAt?: string | null;
}

export interface AdminVideoItem {
  id: string;
  createdAt: string;
  status: VideoStatus;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: AdminVideoUser | null;
  timeline?: unknown[];
  user?: AdminVideoUser | null;
  verification?: VideoVerificationStatus | null;
  expectedEarning: number;
  earning: number;
  video?: AdminVideoInfo | null;

  // Formatted display properties for UI components
  title: string;
  description?: string;
  userId: string;
  userName: string;
  userEmail: string;
  fileKey: string;
  fileSizeFormatted: string;
  fileSizeRaw: number;
  mimeType: string;
  durationFormatted: string;
  createdAtFormatted: string;
  createdAtRaw: string;
  previewUrl?: string;
  reviewNotes?: string;
}

function formatDuration(seconds?: number | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
    return '--:--';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export interface VideoReviewConsoleProps {
  showNavbar?: boolean;
  showHeaderBanner?: boolean;
}

export function VideoReviewConsole({
  showNavbar = true,
  showHeaderBanner = true,
}: VideoReviewConsoleProps = {}) {
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size'>('newest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);

  const handleVideoDurationLoaded = useCallback((videoId: string, durationSeconds: number) => {
    const formatted = formatDuration(durationSeconds);
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, durationFormatted: formatted } : v))
    );
  }, []);

  const fetchAdminSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await staffApi.submissions.list(1, 50);
      if (res && res.data) {
        const mapped: AdminVideoItem[] = res.data.map((sub) => {
          const rawStatus = String(sub.status || 'in_review');
          let mappedStatus: VideoStatus = 'UNDER_REVIEW';
          if (rawStatus === 'approved' || rawStatus === 'payment_pending' || rawStatus === 'SELECTED') {
            mappedStatus = 'SELECTED';
          } else if (rawStatus === 'paid' || rawStatus === 'PAID') {
            mappedStatus = 'PAID';
          } else if (rawStatus === 'rejected' || rawStatus === 'REJECTED') {
            mappedStatus = 'REJECTED';
          } else if (rawStatus === 'draft' || rawStatus === 'PROCESSING') {
            mappedStatus = 'PROCESSING';
          } else {
            mappedStatus = 'UNDER_REVIEW';
          }

          const rawDateStr = sub.createdAt ? String(sub.createdAt) : new Date().toISOString();
          const rawDate = new Date(rawDateStr);
          const formattedDate = rawDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          const sizeBytes = sub.video?.sizeBytes || 0;
          const fileSizeFormatted = sizeBytes > 0
            ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
            : 'N/A';

          const durationFormatted = formatDuration(sub.video?.durationSeconds);

          const subId = String(sub.id || '');

          return {
            id: subId,
            createdAt: rawDateStr,
            status: mappedStatus,
            rejectionReason: (sub.rejectionReason as string | null) || null,
            reviewedAt: (sub.reviewedAt as string | null) || null,
            reviewedBy: (sub.reviewedBy as AdminVideoUser | null) || null,
            timeline: (sub.timeline as unknown[]) || [],
            user: sub.user || null,
            video: sub.video || null,
            title: sub.user?.name || 'Creator User',
            description: `Video submission uploaded by ${sub.user?.name || 'Creator'}.`,
            userId: sub.user?.id || 'usr_unknown',
            userName: sub.user?.email || 'creator@example.com',
            userEmail: sub.user?.email || 'creator@example.com',
            fileKey: sub.video?.originalFilename || `uploads/${subId}.mp4`,
            fileSizeFormatted,
            fileSizeRaw: sizeBytes,
            mimeType: sub.video?.mimeType || 'video/mp4',
            durationFormatted,
            createdAtFormatted: formattedDate,
            createdAtRaw: rawDateStr,
            previewUrl: sub.video?.previewUrl || undefined,
            verification: (sub.verification as VideoVerificationStatus | null) || null,
            expectedEarning: sub.expectedEarning ?? 0,
            earning: sub.earning ?? 0,
          };
        });
        setVideos(mapped);
        if (mapped.length > 0 && mapped[0]) {
          const firstId = mapped[0].id;
          setSelectedVideoId((prev) => prev || firstId);
        }
      } else {
        setVideos([]);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch staff submissions:', err);
      setError('Could not load staff submissions queue.');
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminSubmissions();
  }, [fetchAdminSubmissions]);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: ReviewActionType;
    videoId: string;
    videoTitle: string;
  }>({
    isOpen: false,
    action: 'APPROVE',
    videoId: '',
    videoTitle: '',
  });

  // Filtered and Sorted list
  const filteredVideos = useMemo(() => {
    return videos
      .filter((vid) => {
        const matchesStatus =
          statusFilter === 'ALL' ||
          (statusFilter === 'UNDER_REVIEW' && vid.status === 'UNDER_REVIEW') ||
          (statusFilter === 'SELECTED' && vid.status === 'SELECTED') ||
          (statusFilter === 'REJECTED' && vid.status === 'REJECTED') ||
          (statusFilter === 'PAID' && vid.status === 'PAID');

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          vid.title.toLowerCase().includes(q) ||
          vid.userName.toLowerCase().includes(q) ||
          vid.userEmail.toLowerCase().includes(q) ||
          vid.id.toLowerCase().includes(q);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAtRaw).getTime() - new Date(a.createdAtRaw).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAtRaw).getTime() - new Date(b.createdAtRaw).getTime();
        }
        if (sortBy === 'size') {
          return b.fileSizeRaw - a.fileSizeRaw;
        }
        return 0;
      });
  }, [videos, statusFilter, searchQuery, sortBy]);

  // Selected video item
  const selectedVideo = useMemo(() => {
    return (
      videos.find((v) => v.id === selectedVideoId) ||
      filteredVideos[0] ||
      videos[0]
    );
  }, [videos, selectedVideoId, filteredVideos]);

  // Metrics summary
  const metrics = useMemo(() => {
    const pending = videos.filter((v) => v.status === 'UNDER_REVIEW').length;
    const selected = videos.filter((v) => v.status === 'SELECTED' || v.status === 'PAID');
    const totalPaid = selected.reduce((sum, v) => sum + (v.earning || 0), 0) / 100;
    const rejected = videos.filter((v) => v.status === 'REJECTED').length;
    const totalSubmissions = videos.length;

    return { pending, selectedCount: selected.length, totalPaid, rejected, totalSubmissions };
  }, [videos]);

  const handleOpenReviewModal = (action: ReviewActionType) => {
    if (
      !selectedVideo ||
      selectedVideo.status === 'REJECTED' ||
      selectedVideo.status === 'SELECTED' ||
      selectedVideo.status === 'PAID'
    ) {
      return;
    }
    setModalState({
      isOpen: true,
      action: action,
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
    });
  };

  const handleStartReview = async () => {
    if (!selectedVideo || selectedVideo.status !== 'PROCESSING') return;
    try {
      await staffApi.submissions.updateStatus(selectedVideo.id, {
        status: 'in_review',
      });
      
      setVideos((prev) =>
        prev.map((v) =>
          v.id === selectedVideo.id ? { ...v, status: 'UNDER_REVIEW' } : v
        )
      );
    } catch (error) {
      console.error('Failed to start review:', error);
    }
  };

  const handleSetPaidStatus = async (videoId: string) => {
    try {
      await staffApi.submissions.updateStatus(videoId, {
        status: 'paid',
      });
      setVideos((prev) =>
        prev.map((v) => (v.id === videoId ? { ...v, status: 'PAID' } : v))
      );
    } catch (error) {
      console.error('Failed to set paid status:', error);
    }
  };


  const handleConfirmReview = async (data: {
    action: ReviewActionType;
    earning?: number;
    rejectionReason?: string;
    feedbackNotes?: string;
  }) => {
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      const nextStatus = data.action === 'APPROVE' ? 'approved' : 'rejected';
      await staffApi.submissions.updateStatus(modalState.videoId, {
        status: nextStatus,
        rejectionReason: data.rejectionReason || data.feedbackNotes || (data.action === 'REJECT' ? 'Rejected by administrator' : undefined),
        earning: data.earning,
      });

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id === modalState.videoId) {
            if (data.action === 'APPROVE') {
              return {
                ...v,
                status: 'SELECTED',
                earning: data.earning || 0,
                reviewNotes: data.feedbackNotes,
                reviewedAt: nowFormatted,
              };
            } else {
              return {
                ...v,
                status: 'REJECTED',
                reviewNotes: data.feedbackNotes || data.rejectionReason,
                reviewedAt: nowFormatted,
              };
            }
          }
          return v;
        })
      );
    } catch (err) {
      console.error('Failed to update submission status:', err);
    } finally {
      setModalState((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const consoleBody = (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {showHeaderBanner && (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-300 mb-2 border border-zinc-200 dark:border-zinc-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Internal Admin Console</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              Video Moderation & Verification
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Review creator submissions, inspect video & document quality, approve rewards, or issue rejection feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchAdminSubmissions()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
              id="admin-refresh-queue-btn"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Refresh Queue'}</span>
            </button>
          </div>
        </div>
      )}

          {/* Metric Overview Cards (4 Columns) */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Pending Reviews */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  PENDING REVIEW
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  {metrics.pending}
                </span>
                <span className="text-xs font-medium text-amber-500">
                  requires manual review
                </span>
              </div>
            </div>

            {/* Total Approved & Paid */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  APPROVED REWARDS
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-emerald-500">
                  ${metrics.totalPaid.toFixed(2)}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  ({metrics.selectedCount} approved)
                </span>
              </div>
            </div>

            {/* Rejected Count */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  REJECTED SUBMISSIONS
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                  <FileX2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-red-500">
                  {metrics.rejected}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  non-compliant
                </span>
              </div>
            </div>

            {/* Total Submissions */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  TOTAL SUBMISSIONS
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-purple-400">
                  {metrics.totalSubmissions}
                </span>
                <span className="text-xs font-medium text-purple-400">
                  total received
                </span>
              </div>
            </div>
          </div>

          {/* Search, Status Tabs & Sorting Row */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 max-w-md">
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, creator name, email or ID..."
                className="h-10 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE] dark:bg-zinc-950 pl-10 pr-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                id="admin-search-input"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE] dark:bg-zinc-950 p-1">
                {[
                  { id: 'ALL', label: 'All Queue' },
                  { id: 'UNDER_REVIEW', label: 'In Review' },
                  { id: 'SELECTED', label: 'Approved' },
                  { id: 'REJECTED', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${statusFilter === tab.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                {!showHeaderBanner && (
                  <button
                    type="button"
                    onClick={() => fetchAdminSubmissions()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#FEFEFE] dark:bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all disabled:opacity-50"
                    id="admin-refresh-queue-btn-inline"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE] dark:bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all min-w-[140px]"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
                      <span>
                        {sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'File Size'}
                      </span>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-zinc-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-40 z-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                        {[
                          { id: 'newest', label: 'Newest First' },
                          { id: 'oldest', label: 'Oldest First' },
                          { id: 'size', label: 'File Size' },
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSortBy(option.id as 'newest' | 'oldest' | 'size');
                              setIsSortDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors ${
                              sortBy === option.id
                                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DUAL PANE WORKSPACE */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT PANE: Video Queue List (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 max-h-[820px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                <span>Videos ({filteredVideos.length})</span>
                <span>Select to inspect</span>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-3" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Loading admin submission queue...</span>
                </div>
              ) : (
                filteredVideos.map((item) => {
                  const isSelected = item.id === selectedVideo?.id;
                  const isApproved = item.status === 'SELECTED' || item.status === 'PAID';
                  const isRejected = item.status === 'REJECTED';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedVideoId(item.id)}
                      className={`group relative text-left rounded-3xl border p-4 transition-all ${isSelected
                        ? 'border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-900/90 shadow-md ring-1 ring-zinc-900 dark:ring-white'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700'
                        }`}
                    >
                      {/* Active Left Indicator Strip */}
                      {isSelected && (
                        <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-zinc-900 dark:bg-white" />
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isApproved
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : isRejected
                                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                }`}
                            >
                              {(item.video?.uploadStatus || item.status).toUpperCase()}
                            </span>
                          </div>

                          <h3 className="mt-2 text-sm font-bold text-zinc-900 dark:text-white truncate">
                            {item.title}
                          </h3>

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                              {item.userName}
                            </span>
                            <span>•</span>
                            <span>{item.durationFormatted}</span>
                            <span>•</span>
                            <span>{item.fileSizeFormatted}</span>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-5 w-5 shrink-0 transition-transform ${isSelected
                            ? 'text-zinc-900 dark:text-white translate-x-1'
                            : 'text-zinc-400 opacity-50 group-hover:opacity-100'
                            }`}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/60 pt-2 text.xs text-zinc-400 font-mono text-[11px]">
                        <span>ID: {item.id}</span>
                        <span>{item.createdAtFormatted}</span>
                      </div>
                    </button>
                  );
                })
              )}

              {!isLoading && filteredVideos.length === 0 && (
                <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8 text-center">
                  <Info className="mx-auto h-8 w-8 text-zinc-400" />
                  <p className="mt-2 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                    No videos match filter criteria
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT PANE: Deep Inspection & Approve/Reject Action Center (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {selectedVideo ? (
                <>
                  {/* Video Player */}
                  <VideoPlayer
                    src={selectedVideo.previewUrl}
                    title={selectedVideo.title}
                    durationFormatted={selectedVideo.durationFormatted}
                    onDurationLoaded={(dur) => handleVideoDurationLoaded(selectedVideo.id, dur)}
                  />

                  {/* Submission Details & Creator Meta Grid */}
                  <VideoMetadata selectedVideo={selectedVideo} />

                  {/* ACTION CENTER TOOLBAR (Approve vs Reject) */}
                  <div className="sticky bottom-4 z-30 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-[#FEFEFE]/90 dark:bg-zinc-950/90 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${selectedVideo.status === 'SELECTED'
                          ? 'bg-emerald-500'
                          : selectedVideo.status === 'REJECTED'
                            ? 'bg-red-500'
                            : 'bg-amber-500 animate-pulse'
                          }`}
                      />
                      <span className="text-xs font-bold">
                        Current Status:{' '}
                        <span className="uppercase text-zinc-900 dark:text-white font-extrabold">
                          {selectedVideo.video?.uploadStatus || selectedVideo.status}
                        </span>
                      </span>
                    </div>

                    {selectedVideo.status === 'REJECTED' ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-5 py-2.5 text-xs font-bold text-red-500">
                        <XCircle className="h-4 w-4" />
                        <span>Submission Rejected</span>
                      </div>
                    ) : selectedVideo.status === 'PAID' ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 text-xs font-bold text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Submission Paid & Completed</span>
                      </div>
                    ) : selectedVideo.status === 'SELECTED' ? (
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approved</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSetPaidStatus(selectedVideo.id)}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-95"
                          id="admin-mark-as-paid-btn"
                        >
                          <DollarSign className="h-4 w-4" />
                          <span>Set Paid Status</span>
                        </button>
                      </div>
                    ) : selectedVideo.status === 'PROCESSING' ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleStartReview}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-950/30 transition-all hover:scale-[1.02] hover:bg-blue-500 hover:shadow-xl active:scale-95"
                        >
                          <Play className="h-4 w-4" />
                          <span>Start Review Process</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Reject Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal('REJECT')}
                          className="inline-flex items-center gap-2 rounded-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 px-5 py-2.5 text-xs font-bold transition-all hover:shadow-lg active:scale-95"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject Video</span>
                        </button>

                        {/* Approve Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal('APPROVE')}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] hover:bg-emerald-500 hover:shadow-xl active:scale-95"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Approve & Grant ${((selectedVideo.expectedEarning || 0) / 100).toFixed(2)}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
                  <Info className="mx-auto h-12 w-12 text-zinc-400" />
                  <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                    No Video Selected
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Select a video from the queue on the left to begin moderation inspection.
                  </p>
                </div>
              )}
            </div>
          </div>
    </div>
  );

  return (
    <>
      {showNavbar ? (
        <div className="flex min-h-screen flex-col bg-[#FEFEFE] dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
          <Navbar />
          <main className="flex-1 py-8 lg:py-10">{consoleBody}</main>
          <Footer />
        </div>
      ) : (
        consoleBody
      )}

      {/* Approve / Reject Modal Dialog */}
      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmReview}
        action={modalState.action}
        videoId={modalState.videoId}
        videoTitle={modalState.videoTitle}
        expectedEarning={selectedVideo?.expectedEarning || 0}
      />
    </>
  );
}
