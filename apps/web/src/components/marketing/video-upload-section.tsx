'use client';

import { useState } from 'react';
import { Upload, Film, CheckCircle2, AlertCircle, Sparkles, Lock, LogIn } from 'lucide-react';
import { VideoUploadManager } from '@repo/api-client';
import { AllowedVideoContentTypeSchema } from '@repo/contracts';
import { WebUploadSource } from '@/features/video/web-upload-source';
import { apiClient, submissionsApi } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import { LoginModal } from '@/components/auth/login-modal';

export function VideoUploadSection() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [country, setCountry] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
  
  const validateFile = (selectedFile: File): boolean => {
    if (!AllowedVideoContentTypeSchema.safeParse(selectedFile.type).success) {
      setFile(null);
      setErrorMessage('Please select a valid video file (MP4, MOV, or WEBM).');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(null);
      setErrorMessage('File size exceeds the 100 MB limit.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      setErrorMessage('Please sign in to your account to upload videos.');
      return;
    }
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!validateFile(selectedFile)) return;
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      setErrorMessage('Please sign in to your account to upload videos.');
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (!validateFile(selectedFile)) return;
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      setErrorMessage('Please sign in to your account to upload videos.');
      return;
    }
    if (!file) {
      setErrorMessage('Please attach a video file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setProgress(0);

    try {
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
          country: country,
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
          setProgress(Math.round((uploaded / total) * 100));
        },
        onError: (err: Error) => {
          setIsUploading(false);
          setErrorMessage(err.message || 'Failed to upload video. Please try again.');
        },
        onComplete: (_videoId: string) => {
          setIsUploading(false);
          setUploadSuccess(true);
          setFile(null);
          setCountry('');
        },
      });

      await manager.start();
    } catch (err) {
      setIsUploading(false);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during upload.');
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <section
      id="upload"
      className="border-t border-zinc-200 bg-zinc-50 py-20 text-zinc-900 transition-colors duration-300 md:py-28 dark:border-zinc-900 dark:bg-black dark:text-zinc-50"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-semibold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Instant Monetization</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Upload Your Video
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            Share your authentic moments with us. Upload your raw footage directly for review and
            earn rewards.
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="mt-12 rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg sm:p-10 dark:border-zinc-800 dark:bg-zinc-950">
          {!isAuthLoading && !isAuthenticated ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-sm">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                Sign In Required to Upload
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                You must be logged in to upload video content, submit raw footage for review, and
                receive creator rewards.
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  id="upload-section-login-btn"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log In / Sign Up to Upload</span>
                </button>
              </div>
            </div>
          ) : uploadSuccess ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                Video Uploaded Successfully!
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
                Your video is now under review. You can track its status and expected payout on your
                creator dashboard.
              </p>
              <button
                type="button"
                onClick={() => setUploadSuccess(false)}
                className="mt-8 rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Upload Another Video
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-all hover:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-400"
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  id="video-file-input"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-sm transition-transform group-hover:scale-110 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                  {file ? <Film className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
                </div>

                {file ? (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{file.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">MP4, MOV, or WEBM (Max 100MB)</p>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div>
                <label
                  htmlFor="video-country"
                  className="block text-xs font-bold tracking-wider text-zinc-900 uppercase dark:text-zinc-200"
                >
                  Country
                </label>
                <input
                  type="text"
                  id="video-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States"
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                />
              </div>

              {/* Progress Bar when uploading */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Uploading video to S3 storage...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-2.5 rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !file}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                id="submit-video-btn"
              >
                {isUploading ? (
                  <span>Uploading Video ({progress}%)...</span>
                ) : (
                  <span>Submit Video for Review</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Login Modal for unauthenticated users */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
}
