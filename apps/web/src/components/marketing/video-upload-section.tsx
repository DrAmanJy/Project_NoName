'use client';

import { useState } from 'react';
import { Upload, Film, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function VideoUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [country, setCountry] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('video/')) {
        setErrorMessage('Please select a valid video file (MP4, MOV, etc.).');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (!selectedFile.type.startsWith('video/')) {
        setErrorMessage('Please select a valid video file.');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please attach a video file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setFile(null);
      setCountry('');
    }, 2000);
  };

  return (
    <section id="upload" className="bg-zinc-50 dark:bg-black py-20 md:py-28 border-t border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-200 dark:bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instant Monetization</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
            Upload Your Video
          </h2>
          <p className="mt-3 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            Share your authentic moments with us. Upload your raw footage directly for review and earn rewards.
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="mt-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-lg">
          {uploadSuccess ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-white">
                Video Uploaded Successfully!
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                Your video is now under review. You can track its status and expected payout on your dashboard.
              </p>
              <button
                type="button"
                onClick={() => setUploadSuccess(false)}
                className="mt-8 rounded-full bg-zinc-900 dark:bg-white px-8 py-3 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100"
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
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-8 text-center transition-all hover:border-zinc-900 dark:hover:border-zinc-400"
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  id="video-file-input"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm transition-transform group-hover:scale-110">
                  {file ? <Film className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
                </div>

                {file ? (
                  <div className="mt-4">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      MP4, MOV, or AVI (Max 500MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Input Fields */}
              <div>

                <div>
                  <label htmlFor="video-country" className="block text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                    Country
                  </label>
                  <input
                    type="text"
                    id="video-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    className="mt-2 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-zinc-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-zinc-900 dark:bg-white py-4 text-sm font-semibold text-white dark:text-zinc-900 shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-60"
                id="submit-video-btn"
              >
                {isUploading ? (
                  <span>Uploading Video...</span>
                ) : (
                  <span>Submit Video for Review</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
