'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileVideo,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Wallet,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { VideoUploadManager } from '@repo/api-client';
import { AllowedVideoContentTypeSchema } from '@repo/contracts';
import { WebUploadSource } from '@/features/video/web-upload-source';
import { apiClient, submissionsApi } from '@/lib/api-client';

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'India',
  'Brazil',
  'Mexico',
  'Spain',
  'Italy',
  'Netherlands',
  'Singapore',
  'Other',
];

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [country, setCountry] = useState<string>('United States');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [uploadManager, setUploadManager] = useState<VideoUploadManager | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB limit

  const handleFileSelection = (selectedFile: File) => {
    if (!AllowedVideoContentTypeSchema.safeParse(selectedFile.type).success) {
      setError('Please select a supported video file (.mp4, .mov, or .webm).');
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setError('File size exceeds the 100 MB limit.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setDuration(undefined);

    // Extract video duration in the browser
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      // Ensure the duration is a positive number to pass Zod validation
      if (video.duration > 0) {
        setDuration(video.duration);
      }
    };
    video.onerror = () => {
      window.URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected) handleFileSelection(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelection(droppedFile);
    }
  };

  const handleStartUpload = async () => {
    if (!file || status === 'uploading' || status === 'completed') return;

    try {
      setError(null);
      setStatus('uploading');
      
      const idempotencyKey = crypto.randomUUID();
      const totalParts = Math.ceil(file.size / (8 * 1024 * 1024));

      const parsedType = AllowedVideoContentTypeSchema.safeParse(file.type);
      const contentType = parsedType.success ? parsedType.data : 'video/mp4';

      const response = await submissionsApi.create(
        {
          fileName: file.name,
          contentType,
          fileSize: file.size,
          totalParts,
          country,
          durationSeconds: duration,
        },
        idempotencyKey,
      );

      const source = new WebUploadSource(file);
      const manager = new VideoUploadManager({
        apiClient,
        uploadId: response.uploadId,
        source,
        fileName: file.name,
        onProgress: (uploaded: number, total: number) => {
          if (!total || total <= 0) return;
          const pct = Math.min(100, Math.max(0, Math.round((uploaded / total) * 100)));
          setProgress(pct);
        },
        onStateChange: (state: string) => {
          setStatus(state);
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onComplete: (videoId: string) => {
          setProgress(100);
          setStatus('completed');
          if (process.env.NODE_ENV !== 'production') {
            process.stdout?.write?.(`Upload complete, ID: ${videoId}\n`);
          }
        },
      });

      setUploadManager(manager);
      await manager.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCancel = async () => {
    if (uploadManager) {
      await uploadManager.cancel();
      setUploadManager(null);
      setFile(null);
      setProgress(0);
      setStatus('idle');
    }
  };

  const handleRetry = async () => {
    if (uploadManager) {
      await uploadManager.start();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 sm:p-8 shadow-lg transition-colors">
      {/* Upload Complete Success Screen */}
      {status === 'completed' ? (
        <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              Video Uploaded Successfully!
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
              Your video <span className="font-semibold text-zinc-900 dark:text-white">&quot;{file?.name}&quot;</span> ({country}) has been received and queued for review.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-900">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-bold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
              id="upload-complete-dashboard-btn"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <Link
              href="/dashboard/earnings"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-md transition-all"
              id="upload-complete-earnings-btn"
            >
              <Wallet className="h-4 w-4" />
              <span>View Creator Earnings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : uploadManager ? (
        /* Uploading / Progress View */
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <FileVideo className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {file?.name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {file && formatFileSize(file.size)} • Country: {country} • Status: <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">{status}</span>
                </p>
              </div>
            </div>

            <span className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {Math.min(100, Math.max(0, progress))}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-linear-to-r from-amber-500 to-emerald-500 h-3 rounded-full transition-all duration-300 relative"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="font-bold">Upload Encountered an Issue</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-900 text-xs font-semibold">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>S3 Presigned Multipart Chunk Upload</span>
            </div>

            <div className="flex items-center gap-3">
              {status === 'error' && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  Retry Upload
                </button>
              )}
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl bg-red-100 dark:bg-red-950/50 hover:bg-red-200 dark:hover:bg-red-900/80 text-red-700 dark:text-red-300 px-4 py-2 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form & Drag-and-Drop Dropzone View */
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Step 1: Video File & Region Selection</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Select Video File & Country
            </h3>
          </div>

          {/* Drag & Drop File Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                : 'border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="video-file-input"
            />

            {file ? (
              <div className="flex items-center justify-between w-full p-2">
                <div className="flex items-center gap-3 text-left">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <FileVideo className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatFileSize(file.size)} • Ready for direct S3 upload
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-red-500 hover:text-white transition-colors"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white mb-3 shadow-inner">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Drag & drop your video here, or <span className="text-amber-600 dark:text-amber-400 underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Supports MP4, MOV, or WEBM (Max 100 MB)
                </p>
              </>
            )}
          </div>

          {/* Country Selection Dropdown */}
          <div className="pt-2">
            <label htmlFor="country-select-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-amber-500" />
              <span>Select Country / Region</span>
            </label>
            <select
              id="country-select-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white outline-none focus:border-zinc-900 dark:focus:border-white transition-colors cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/40 p-4 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-900">
            <button
              type="button"
              onClick={handleStartUpload}
              disabled={!file || status === 'uploading'}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white py-3.5 text-sm font-bold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              id="start-upload-submit-btn"
            >
              <Upload className={`h-4 w-4 ${status === 'uploading' ? 'animate-bounce' : ''}`} />
              <span>{status === 'uploading' ? 'Starting Upload...' : 'Start Multipart Video Upload'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
