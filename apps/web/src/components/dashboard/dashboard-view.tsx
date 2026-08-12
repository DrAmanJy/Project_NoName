'use client';

import { useState } from 'react';
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
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import type { VideoStatus } from '@repo/contracts';

interface VideoProgressStep {
  title: string;
  description: string;
  state: 'completed' | 'current' | 'pending' | 'rejected';
  timestamp?: string;
}

interface UploadedVideoItem {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  duration: string;
  uploadedAt: string;
  status: VideoStatus;
  statusLabel: string;
  rewardAmount?: string;
  thumbnailBg: string;
  steps: VideoProgressStep[];
  rejectionReason?: string;
}

export function DashboardView() {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<UploadedVideoItem | null>(null);

  const mockVideos: UploadedVideoItem[] = [
    {
      id: 'vid-101',
      title: 'Urban Exploration & Coffee Culture Vlog',
      fileName: 'urban_coffee_vlog_4k.mp4',
      fileSize: '124.5 MB',
      duration: '03:42',
      uploadedAt: 'Aug 11, 2026',
      status: 'UNDER_REVIEW',
      statusLabel: 'In Review',
      rewardAmount: '$35.00',
      thumbnailBg: 'from-amber-600/30 to-zinc-900',
      steps: [
        {
          title: 'Video Uploaded',
          description: 'Multipart chunk upload completed successfully',
          state: 'completed',
          timestamp: 'Aug 11, 2026 • 10:15 AM',
        },
        {
          title: 'Transcoding & Processing',
          description: 'Format optimization and resolution check done',
          state: 'completed',
          timestamp: 'Aug 11, 2026 • 10:17 AM',
        },
        {
          title: 'Quality & Guideline Review',
          description: 'Reviewing against platform guidelines',
          state: 'current',
          timestamp: 'In progress (Est. 2-4 hours remaining)',
        },
        {
          title: 'Payout Approval',
          description: 'Reward credited to creator wallet',
          state: 'pending',
        },
      ],
    },
    {
      id: 'vid-102',
      title: 'Mountain Sunset Timelapse Experience',
      fileName: 'mountain_sunset_timelapse.mov',
      fileSize: '88.2 MB',
      duration: '02:15',
      uploadedAt: 'Aug 09, 2026',
      status: 'PAID',
      statusLabel: 'Approved & Paid',
      rewardAmount: '$50.00',
      thumbnailBg: 'from-emerald-600/30 to-zinc-900',
      steps: [
        {
          title: 'Video Uploaded',
          description: 'Upload verified',
          state: 'completed',
          timestamp: 'Aug 09, 2026 • 02:30 PM',
        },
        {
          title: 'Transcoding & Processing',
          description: 'H.264 1080p stream generated',
          state: 'completed',
          timestamp: 'Aug 09, 2026 • 02:32 PM',
        },
        {
          title: 'Quality & Guideline Review',
          description: 'Passed all manual quality standards',
          state: 'completed',
          timestamp: 'Aug 09, 2026 • 04:10 PM',
        },
        {
          title: 'Payout Approval',
          description: '$50.00 transferred to wallet balance',
          state: 'completed',
          timestamp: 'Aug 09, 2026 • 04:15 PM',
        },
      ],
    },
    {
      id: 'vid-103',
      title: 'Tech Gadget Unboxing & First Impression',
      fileName: 'gadget_unbox_draft1.mp4',
      fileSize: '210.0 MB',
      duration: '05:20',
      uploadedAt: 'Aug 11, 2026',
      status: 'PROCESSING',
      statusLabel: 'Processing',
      rewardAmount: '$40.00',
      thumbnailBg: 'from-blue-600/30 to-zinc-900',
      steps: [
        {
          title: 'Video Uploaded',
          description: 'Upload finished',
          state: 'completed',
          timestamp: 'Aug 11, 2026 • 04:45 PM',
        },
        {
          title: 'Transcoding & Processing',
          description: 'Generating adaptive streaming formats',
          state: 'current',
          timestamp: 'Processing 75%',
        },
        {
          title: 'Quality & Guideline Review',
          description: 'Queued for review team',
          state: 'pending',
        },
        {
          title: 'Payout Approval',
          description: 'Pending review outcome',
          state: 'pending',
        },
      ],
    },
    {
      id: 'vid-104',
      title: 'Night Drone Shots of City Skyline',
      fileName: 'city_drone_night_fail.mp4',
      fileSize: '64.8 MB',
      duration: '01:45',
      uploadedAt: 'Aug 07, 2026',
      status: 'REJECTED',
      statusLabel: 'Rejected',
      rewardAmount: '$0.00',
      rejectionReason: 'Video resolution below required 1080p threshold or contains heavy compression artifacts.',
      thumbnailBg: 'from-red-600/30 to-zinc-900',
      steps: [
        {
          title: 'Video Uploaded',
          description: 'File received',
          state: 'completed',
          timestamp: 'Aug 07, 2026 • 11:20 AM',
        },
        {
          title: 'Transcoding & Processing',
          description: 'Transcode complete',
          state: 'completed',
          timestamp: 'Aug 07, 2026 • 11:22 AM',
        },
        {
          title: 'Quality & Guideline Review',
          description: 'Failed technical requirements (Low resolution)',
          state: 'rejected',
          timestamp: 'Aug 07, 2026 • 01:05 PM',
        },
      ],
    },
    {
      id: 'vid-105',
      title: 'Beachside Fitness & Workout Routine',
      fileName: 'beach_workout_4k.mp4',
      fileSize: '155.3 MB',
      duration: '04:10',
      uploadedAt: 'Aug 03, 2026',
      status: 'PAID',
      statusLabel: 'Approved & Paid',
      rewardAmount: '$60.00',
      thumbnailBg: 'from-emerald-600/30 to-zinc-900',
      steps: [
        {
          title: 'Video Uploaded',
          description: 'Upload verified',
          state: 'completed',
          timestamp: 'Aug 03, 2026 • 09:00 AM',
        },
        {
          title: 'Transcoding & Processing',
          description: 'Transcode complete',
          state: 'completed',
          timestamp: 'Aug 03, 2026 • 09:03 AM',
        },
        {
          title: 'Quality & Guideline Review',
          description: 'Approved by review panel',
          state: 'completed',
          timestamp: 'Aug 03, 2026 • 11:30 AM',
        },
        {
          title: 'Payout Approval',
          description: '$60.00 transferred to wallet balance',
          state: 'completed',
          timestamp: 'Aug 03, 2026 • 11:35 AM',
        },
      ],
    },
  ];

  const filteredVideos = mockVideos.filter((video) => {
    const matchesFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'PROCESSING' && (video.status === 'PROCESSING' || video.status === 'UPLOADING')) ||
      (selectedFilter === 'IN_REVIEW' && video.status === 'UNDER_REVIEW') ||
      (selectedFilter === 'PAID' && (video.status === 'PAID' || video.status === 'SELECTED')) ||
      (selectedFilter === 'REJECTED' && video.status === 'REJECTED');

    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const totalVideos = mockVideos.length;
  const inReviewCount = mockVideos.filter((v) => v.status === 'UNDER_REVIEW' || v.status === 'PROCESSING').length;
  const paidCount = mockVideos.filter((v) => v.status === 'PAID' || v.status === 'SELECTED').length;
  const totalEarnedAmount = 110.0;
  const pendingEarnedAmount = 75.0;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <Navbar />

      <main className="flex-1 py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-900 pb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-300 mb-3 border border-zinc-200 dark:border-zinc-800">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Creator Management Portal</span>
              </div>
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
                className="group inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 dark:hover:bg-emerald-600 hover:shadow-lg hover:scale-[1.02]"
                id="dashboard-view-earnings-btn"
              >
                <Wallet className="h-4 w-4" />
                <span>View Earnings</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>

              <Link
                href="/dashboard/videos/upload"
                className="group inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:shadow-lg hover:scale-[1.02]"
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
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  TOTAL UPLOADS
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white">
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
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  IN REVIEW / PROCESSING
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {inReviewCount} Pending
              </div>
              <div className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verification in progress</span>
              </div>
            </div>

            {/* Card 3: Approved & Paid */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  APPROVED & PAID
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {paidCount} Approved
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Direct payouts unlocked
              </div>
            </div>

            {/* Card 4: Total & Pending Earnings Summary Card */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-zinc-900 to-zinc-950 p-6 text-white shadow-sm transition-all hover:border-emerald-500/60">
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
            </div>

            {/* Video Items List / Grid */}
            <div className="space-y-4">
              {filteredVideos.map((video) => {
                const isRejected = video.status === 'REJECTED';
                const isInReview = video.status === 'UNDER_REVIEW';
                const isProcessing = video.status === 'PROCESSING' || video.status === 'UPLOADING';
                const isPaid = video.status === 'PAID' || video.status === 'SELECTED';

                return (
                  <div
                    key={video.id}
                    className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-700"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left: Video Preview & Metadata */}
                      <div className="flex items-start gap-4">
                        {/* Video Thumbnail Placeholder */}
                        <div
                          className={`relative flex h-24 w-36 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${video.thumbnailBg} border border-zinc-700/50 shadow-inner group-hover:scale-102 transition-transform`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                            <Play className="h-4 w-4 fill-white ml-0.5" />
                          </div>
                          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white">
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
          </div>
        </div>
      </main>

      {/* Video Details & Audit Log Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <FileVideo className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Video Status & Timeline Audit
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

            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
      )}

      <Footer />
    </div>
  );
}
