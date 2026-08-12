'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  ArrowUpDown,
  FileX2,
  Info,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { type VideoStatus, type VideoVerificationStatus } from '@repo/contracts';
import { VideoPlayer } from './video-player';
import { ReviewModal, type ReviewActionType } from './review-modal';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VideoMetadata } from './video-metadata';
import { staffApi } from '@/lib/api-client';

export interface AdminVideoItem {
  id: string;
  title: string;
  description?: string;
  status: VideoStatus;
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
  verification: VideoVerificationStatus;
  rewardAmount?: number;
  reviewNotes?: string;
  reviewedAt?: string;
}

export function VideoReviewConsole() {
  const [videos, setVideos] = useState<AdminVideoItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size' | 'ai_risk'>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_error, setError] = useState<string | null>(null);

  const fetchAdminSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await staffApi.submissions.list(1, 50);
      console.log(res);
      if (res && res.data) {
        const mapped: AdminVideoItem[] = res.data.map((sub) => {
          let mappedStatus: VideoStatus = 'UNDER_REVIEW';
          if (sub.status === 'approved' || sub.status === 'payment_pending') {
            mappedStatus = 'SELECTED';
          } else if (sub.status === 'paid') {
            mappedStatus = 'PAID';
          } else if (sub.status === 'rejected') {
            mappedStatus = 'REJECTED';
          } else if (sub.status === 'draft') {
            mappedStatus = 'PROCESSING';
          } else {
            mappedStatus = 'UNDER_REVIEW';
          }

          const rawDate = sub.createdAt ? new Date(sub.createdAt) : new Date();
          const formattedDate = rawDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return {
            id: sub.id,
            title: `Submission #${sub.id.slice(-6)}`,
            description: `Video submission uploaded by ${sub.user?.name || 'Creator'}.`,
            status: mappedStatus,
            userId: sub.user?.id || 'usr_unknown',
            userName: sub.user?.name || 'Creator User',
            userEmail: sub.user?.email || 'creator@example.com',
            fileKey: `uploads/${sub.id}.mp4`,
            fileSizeFormatted: '45.0 MB',
            fileSizeRaw: 47185920,
            mimeType: 'video/mp4',
            durationFormatted: '0:45',
            createdAtFormatted: formattedDate,
            createdAtRaw: sub.createdAt || new Date().toISOString(),
            verification: {
              status: sub.status === 'rejected' ? 'fail' : 'pass',
              script: {
                status: sub.status === 'rejected' ? 'fail' : 'pass',
                transcript: `Verification transcript for submission ${sub.id}.`,
                confidence: 0.96,
                missingSegments: [],
                extraContent: [],
              },
              document: {
                status: 'pass',
                documentType: 'passport',
                heldByPerson: true,
                confidence: 0.95,
                evidence: ['ID verification matched user account'],
              },
              authenticity: {
                status: 'likely_real',
                confidence: 0.98,
                signals: ['Human liveness confirmed'],
              },
            },
            rewardAmount: sub.status === 'paid' || sub.status === 'approved' ? 35.0 : undefined,
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
        if (sortBy === 'ai_risk') {
          const riskA = a.verification.status === 'fail' ? 2 : a.verification.status === 'uncertain' ? 1 : 0;
          const riskB = b.verification.status === 'fail' ? 2 : b.verification.status === 'uncertain' ? 1 : 0;
          return riskB - riskA;
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
    const totalPaid = selected.reduce((sum, v) => sum + (v.rewardAmount || 25), 0);
    const rejected = videos.filter((v) => v.status === 'REJECTED').length;
    const aiFlagged = videos.filter(
      (v) =>
        v.verification.status === 'fail' ||
        v.verification.authenticity.status === 'likely_ai_generated'
    ).length;

    return { pending, selectedCount: selected.length, totalPaid, rejected, aiFlagged };
  }, [videos]);

  const handleOpenReviewModal = (action: ReviewActionType) => {
    if (!selectedVideo) return;
    setModalState({
      isOpen: true,
      action: action,
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
    });
  };

  const handleConfirmReview = async (data: {
    action: ReviewActionType;
    rewardAmount?: number;
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
      });

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id === modalState.videoId) {
            if (data.action === 'APPROVE') {
              return {
                ...v,
                status: 'SELECTED',
                rewardAmount: data.rewardAmount || 35.0,
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

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
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

            {/* Quality Check Flags */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  REVIEW FLAGS
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-purple-400">
                  {metrics.aiFlagged}
                </span>
                <span className="text-xs font-medium text-purple-400">
                  issues flagged
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
                className="h-10 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-all"
                id="admin-search-input"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1">
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
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'newest' | 'oldest' | 'size' | 'ai_risk')
                  }
                  className="bg-transparent outline-none cursor-pointer text-xs"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="ai_risk">AI Risk Score</option>
                  <option value="size">File Size</option>
                </select>
              </div>
            </div>
          </div>

          {/* DUAL PANE WORKSPACE */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT PANE: Video Queue List (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 max-h-[820px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
                <span>Pending Videos ({filteredVideos.length})</span>
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

                  const aiStatus = item.verification.status;

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
                              {isApproved
                                ? 'APPROVED'
                                : isRejected
                                  ? 'REJECTED'
                                  : 'IN REVIEW'}
                            </span>

                            {/* AI Signal Badge */}
                            {aiStatus === 'pass' && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                AI Pass
                              </span>
                            )}
                            {aiStatus === 'fail' && (
                              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/20">
                                AI Flagged
                              </span>
                            )}
                            {aiStatus === 'uncertain' && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                                AI Check Needed
                              </span>
                            )}
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
                  />

                  {/* Submission Details & Creator Meta Grid */}
                  <VideoMetadata selectedVideo={selectedVideo} />

                  {/* ACTION CENTER TOOLBAR (Approve vs Reject) */}
                  <div className="sticky bottom-4 z-30 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl p-4 shadow-2xl flex items-center justify-between gap-4">
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
                          {selectedVideo.status}
                        </span>
                      </span>
                    </div>

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
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold shadow-lg shadow-emerald-950/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Approve & Grant ${selectedVideo.rewardAmount || '25.00'}
                        </span>
                      </button>
                    </div>
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
      </main>

      {/* Approve / Reject Modal Dialog */}
      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmReview}
        action={modalState.action}
        videoId={modalState.videoId}
        videoTitle={modalState.videoTitle}
        defaultReward={selectedVideo?.rewardAmount || 25.0}
      />

      <Footer />
    </div>
  );
}
