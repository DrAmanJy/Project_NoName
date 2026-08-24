'use client';

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isReducedMotion } from '@/lib/gsap';
import { Upload, Film, CheckCircle2, AlertCircle, Lock, LogIn, Check } from 'lucide-react';
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

  const containerRef = useRef<HTMLDivElement>(null);

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

  useGSAP(() => {
    if (isReducedMotion()) return;

    gsap.fromTo(".upload-content", 
      { opacity: 0, x: -30 },
      {
        opacity: 1, 
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      }
    );

    gsap.fromTo(".upload-card", 
      { opacity: 0, x: 30 },
      {
        opacity: 1, 
        x: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      }
    );
  }, { scope: containerRef });

  if (isAuthenticated) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      id="upload"
      className="relative py-28 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 overflow-hidden transition-colors duration-300"
    >
      {/* Decorative Radial Background Lights */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-zinc-100/50 dark:bg-zinc-900/20 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-zinc-100/50 dark:bg-zinc-900/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Heading and Details */}
          <div className="upload-content lg:col-span-6 space-y-6">
           
            
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-none">
              Upload Your Video
            </h2>
            
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Share your authentic everyday moments with us. Upload your raw footage directly for review and earn high-tier payouts. No professional editing or follower count required.
            </p>

            <ul className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
              {[
                "Secure, direct Cloudflare R2 video uploads",
                "Automated quality and aspect ratio checks",
                "Payouts sent to your balance within 24-48 hours",
                "Keep content ownership until explicitly purchased"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                  </div>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Interaction Card */}
          <div className="upload-card lg:col-span-6">
            <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm p-8 sm:p-10 shadow-xl dark:shadow-none relative overflow-hidden">
              
              {!isAuthLoading && !isAuthenticated ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm">
                    <Lock className="h-7 w-7" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    Sign In to Upload
                  </h3>
                  
                  <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                    You must be signed in to your creator account to upload videos, submit files for moderation, and receive payouts.
                  </p>
                  
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 text-sm font-bold shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98]"
                      id="upload-section-login-btn"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Log In / Sign Up to Upload</span>
                    </button>
                  </div>
                </div>
              ) : uploadSuccess ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  
                  <h3 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                    Upload Complete!
                  </h3>
                  
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Your video is now in the review queue. You can track progress and view payout details directly on your dashboard.
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
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-400 bg-white dark:bg-zinc-900/50 p-8 text-center transition-all duration-300"
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      id="video-file-input"
                    />
                    
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                      {file ? <Film className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
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
                      className="mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white transition-colors outline-none placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white"
                    />
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        <span>Uploading video to S3 storage...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-zinc-950 dark:bg-white transition-all duration-300"
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 text-sm font-semibold shadow-md transition-all hover:bg-zinc-850 dark:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
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

        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
}
