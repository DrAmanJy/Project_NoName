'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Video,
  Wallet,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  ArrowUpRight,
  DollarSign,
  FileVideo,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { submissionsApi } from '@/lib/api-client';
import type { VideoStatus } from '@repo/contracts';

interface VideoProgressStep {
  title: string;
  description: string;
  state: 'completed' | 'current' | 'pending' | 'rejected';
  timestamp?: string;
}

interface UploadedVideoItem {
  createdAt: string;
  earning: number;
  expectedEarning: number;
  id: string;
  status: string;
  timeline: any[];
  video?: {
    durationSeconds: number | null;
    height: number | null;
    id: string;
    mimeType: string;
    originalFilename: string;
    previewUrl: string | null;
    sizeBytes: number;
    uploadStatus: string;
    uploadedAt: string | null;
    width: number | null;
  } | null;
}

export function DashboardView() {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideoItem | null>(null);
  const [videos, setVideos] = useState<UploadedVideoItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await submissionsApi.list(1, 50).catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setVideos(res.data as UploadedVideoItem[]);
      } else {
        setVideos([]);
      }
    } catch {
      setVideos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserSubmissions();
  }, [fetchUserSubmissions]);

  const filteredVideos = videos.filter((video) => {
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'PROCESSING' && (video.status === 'draft' || video.status === 'uploading' || video.status === 'PROCESSING')) ||
      (selectedFilter === 'IN_REVIEW' && (video.status === 'in_review' || video.status === 'UNDER_REVIEW')) ||
      (selectedFilter === 'PAID' && (video.status === 'paid' || video.status === 'approved' || video.status === 'PAID')) ||
      (selectedFilter === 'REJECTED' && (video.status === 'rejected' || video.status === 'REJECTED'));

    const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const title = `Submission - ${formattedDate}`;
    const fileName = video.video?.originalFilename || `submission_${video.id.slice(-6)}.mp4`;

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fileName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalVideos = videos.length;
  const inReviewCount = videos.filter((v) => v.status === 'UNDER_REVIEW' || v.status === 'PROCESSING' || v.status === 'in_review' || v.status === 'draft').length;
  const paidCount = videos.filter((v) => v.status === 'PAID' || v.status === 'SELECTED' || v.status === 'paid' || v.status === 'approved').length;
  const totalEarnedAmount = videos
    .filter((v) => v.status === 'PAID' || v.status === 'SELECTED' || v.status === 'paid' || v.status === 'approved')
    .reduce((acc, v) => acc + (v.earning || 50), 0);
  const pendingEarnedAmount = videos
    .filter((v) => v.status === 'UNDER_REVIEW' || v.status === 'PROCESSING' || v.status === 'in_review' || v.status === 'draft')
    .reduce((acc, v) => acc + (v.expectedEarning || 35), 0);

  const getDerivedVideoData = (video: UploadedVideoItem) => {
    const isRejected = video.status === 'REJECTED' || video.status === 'rejected';
    const isInReview = video.status === 'UNDER_REVIEW' || video.status === 'in_review';
    const isProcessing = video.status === 'PROCESSING' || video.status === 'UPLOADING' || video.status === 'draft' || video.status === 'uploading';
    const isPaid = video.status === 'PAID' || video.status === 'SELECTED' || video.status === 'paid' || video.status === 'approved';

    let statusLabel = 'In Review';
    if (isPaid) statusLabel = 'Approved & Paid';
    else if (isRejected) statusLabel = 'Rejected';
    else if (isProcessing) statusLabel = 'Processing';

    const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const title = `Submission - ${formattedDate}`;
    const fileName = video.video?.originalFilename || `submission_${video.id.slice(-6)}.mp4`;
    const fileSize = video.video?.sizeBytes ? `${(video.video.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : '0 MB';
    
    const durationSeconds = video.video?.durationSeconds || 0;
    const duration = `${Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:${Math.floor(durationSeconds % 60).toString().padStart(2, '0')}`;
    const uploadedAt = formattedDate;

    const rewardAmount = (video.status === 'paid' || video.status === 'approved' || video.status === 'PAID' || video.status === 'SELECTED') 
      ? `$${(video.earning || 50).toFixed(2)}` 
      : `$${(video.expectedEarning || 0).toFixed(2)}`;
    const thumbnailBg = 'from-amber-600/30 to-zinc-900';
    const videoUrl = video.video?.previewUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    
    type VideoProgressStep = { title: string; description: string; state: 'completed' | 'current' | 'pending' | 'rejected'; timestamp?: string };

    const steps: VideoProgressStep[] = video.timeline && video.timeline.length > 0
      ? video.timeline.map((step) => ({
          title: step.key === 'video_uploaded' ? 'Video Uploaded' : step.key === 'under_review' ? 'Quality & Guideline Review' : 'Payout Approval',
          description: step.message || 'Timeline step status updated',
          state: step.status as VideoProgressStep['state'],
          timestamp: step.completedAt ? new Date(step.completedAt).toLocaleString() : undefined,
        }))
      : [
          { title: 'Video Uploaded', description: 'S3 chunk upload verified', state: 'completed', timestamp: new Date(video.createdAt).toLocaleString() },
          { title: 'Quality & Guideline Review', description: 'Checking content against guidelines', state: isInReview ? 'current' : isRejected ? 'rejected' : 'completed' },
          { title: 'Payout Approval', description: 'Reward disbursement to wallet', state: isPaid ? 'completed' : 'pending' },
        ];

    return { isRejected, isInReview, isProcessing, isPaid, statusLabel, title, fileName, fileSize, duration, uploadedAt, rewardAmount, thumbnailBg, videoUrl, steps, rejectionReason: undefined };
  };

  const selectedDerivedVideo = selectedVideo ? { ...selectedVideo, ...getDerivedVideoData(selectedVideo) } : null;

  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300 overflow-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/5" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5" />

      <Navbar />

      <main className="relative flex-1 py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                Creator Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                Monitor your uploaded videos, track real-time moderation & progress statuses, and manage your video earnings.
              </p>
            </div>

            {/* Quick Navigation Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/earnings"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5"
                id="dashboard-view-earnings-btn"
              >
                <Wallet className="h-4 w-4" />
                <span>View Earnings</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/dashboard/videos/upload"
                className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-zinc-900 shadow-md transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-xl hover:-translate-y-0.5"
                id="dashboard-upload-video-btn"
              >
                <Upload className="h-4 w-4" />
                <span>Upload New Video</span>
              </Link>
            </div>
          </div>

          {/* Key KPI Overview Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Uploads */}
            <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  TOTAL UPLOADS
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <FileVideo className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {totalVideos} Videos
              </div>
              <div className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Lifetime submissions
              </div>
            </div>

            {/* Card 2: In Review / Processing */}
            <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 dark:hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  IN REVIEW / PROCESSING
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {inReviewCount} Pending
              </div>
              <div className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span>Verification in progress</span>
              </div>
            </div>

            {/* Card 3: Approved & Paid */}
            <div className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/50 dark:hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  APPROVED & PAID
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {paidCount} Approved
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                <span>Direct payouts unlocked</span>
              </div>
            </div>

            {/* Card 4: Total & Pending Earnings Summary Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-zinc-900 to-zinc-950 p-6 text-white shadow-md transition-all duration-300 hover:border-emerald-500/60 hover:shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  TOTAL EARNINGS
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                ${totalEarnedAmount.toFixed(2)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Pending: ${pendingEarnedAmount.toFixed(2)}</span>
                <Link
                  href="/dashboard/earnings"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Video Submissions Management Section */}
          <div className="mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Uploaded Videos & Review Status
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Track progress timelines and payout milestones for each video submission.
                </p>
              </div>

              {/* Controls: Search & Filter Tabs */}
              {videos.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Search input */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search videos by title..."
                      className="h-10 w-full sm:w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-4 text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                      id="dashboard-search-input"
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
                      id="filter-tab-all"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('PROCESSING')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'PROCESSING'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                      id="filter-tab-processing"
                    >
                      Processing
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('IN_REVIEW')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'IN_REVIEW'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                      id="filter-tab-in-review"
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
                      id="filter-tab-paid"
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFilter('REJECTED')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        selectedFilter === 'REJECTED'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                      id="filter-tab-rejected"
                    >
                      Rejected
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video Items List / Loading / Empty State */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Loading your video submissions...
                </p>
              </div>
            ) : videos.length === 0 ? (
              /* Explicit No Video Uploaded Empty State */
              <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 sm:p-16 text-center bg-zinc-50/50 dark:bg-zinc-950/50">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 mb-4">
                  <Video className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No video uploaded
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  You haven&apos;t uploaded any videos yet. Start uploading your video content to track real-time moderation, quality verification, and earn rewards.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/videos/upload"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-bold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02]"
                    id="dashboard-empty-upload-btn"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Your First Video</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((rawVideo) => {
                  const derived = getDerivedVideoData(rawVideo);
                  const video = { ...rawVideo, ...derived };
                  const { isRejected, isInReview, isProcessing, isPaid } = derived;

                  return (
                    <div
                      key={video.id}
                      className="group rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        {/* Left: Video Preview & Metadata */}
                        <div className="flex items-start gap-4">
                          {/* Video Thumbnail Placeholder */}
                          <div
                            onClick={() => setSelectedVideo(video)}
                            className={`relative flex h-24 w-36 shrink-0 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-br ${video.thumbnailBg} border border-zinc-700/50 shadow-inner group-hover:scale-102 transition-transform duration-300`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                              <Play className="h-4 w-4 fill-white ml-0.5" />
                            </div>
                            <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white shadow-sm">
                              {video.duration}
                            </span>
                          </div>

                          {/* Details */}
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                                {video.title}
                              </h3>
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                                  isPaid
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : isInReview
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    : isProcessing
                                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                    : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                                }`}
                              >
                                {isProcessing && <RefreshCw className="h-3 w-3 animate-spin" />}
                                {isInReview && <Clock className="h-3 w-3" />}
                                {isPaid && <CheckCircle2 className="h-3 w-3" />}
                                {isRejected && <AlertCircle className="h-3 w-3" />}
                                <span>{video.statusLabel}</span>
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                              <span>{video.fileName}</span>
                              <span>•</span>
                              <span>{video.fileSize}</span>
                              <span>•</span>
                              <span>Uploaded on {video.uploadedAt}</span>
                            </p>

                            {/* Rejection Notice Banner if Rejected */}
                            {isRejected && video.rejectionReason && (
                              <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300">
                                <span className="font-bold">Reason: </span>
                                {video.rejectionReason}
                              </div>
                            )}

                            {/* Reward Badge */}
                            {video.rewardAmount && !isRejected && (
                              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                                <DollarSign className="h-3.5 w-3.5" />
                                <span>Reward Target: {video.rewardAmount}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-start">
                          <button
                            type="button"
                            onClick={() => setSelectedVideo(video)}
                            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-xs font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                            id={`play-video-btn-${video.id}`}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Play Video</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedVideo(video)}
                            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            id={`video-details-btn-${video.id}`}
                          >
                            <Eye className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Status Details</span>
                          </button>

                          {isPaid && (
                            <Link
                              href="/dashboard/earnings"
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
                              id={`video-earnings-btn-${video.id}`}
                            >
                              <Wallet className="h-3.5 w-3.5" />
                              <span>View Earning</span>
                            </Link>
                          )}

                          {isRejected && (
                            <Link
                              href="/dashboard/videos/upload"
                              className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 text-xs font-bold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                            >
                              <Upload className="h-3.5 w-3.5" />
                              <span>Re-upload</span>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Horizontal 4-Step Progress Tracker */}
                      <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-900">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {video.steps.map((step, idx) => {
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

                {filteredVideos.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center">
                    <Video className="mx-auto h-12 w-12 text-zinc-400" />
                    <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">
                      No matching videos found
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Try adjusting your search query or filter selection.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Details & Audit Log Modal */}
      {selectedDerivedVideo && (() => {
        const selectedVideo = selectedDerivedVideo;
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Video Player & Status Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                id="close-video-modal-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              {/* HTML5 Video Player */}
              <div className="relative overflow-hidden rounded-2xl bg-black border border-zinc-200 dark:border-zinc-800 shadow-md">
                <video
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                  src={selectedVideo.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                  className="w-full aspect-video rounded-2xl object-contain bg-black"
                >
                  Your browser does not support HTML5 video playback.
                </video>
              </div>

              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 p-4 border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedVideo.title}
                </h4>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <div>
                    <span className="font-semibold text-zinc-400 block">File Name</span>
                    <span>{selectedVideo.fileName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-400 block">Duration</span>
                    <span>{selectedVideo.duration}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-400 block">Target Reward</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedVideo.rewardAmount || '$0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Log Steps */}
              <div className="pl-2 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Detailed Step Audit Log
                </h5>
                {selectedVideo.steps.map((step, idx) => (
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

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Close
              </button>
              <Link
                href="/dashboard/earnings"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Go to Earnings Page</span>
              </Link>
            </div>
          </div>
        </div>
        );
      })()}

      <Footer />
    </div>
  );
}
