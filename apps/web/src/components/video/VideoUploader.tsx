'use client';

import React, { useState, useRef } from 'react';
import { VideoUploadManager } from '@repo/api-client';
import { WebUploadSource } from '@/features/video/web-upload-source';
import { apiClient, submissionsApi } from '@/lib/api-client';

export function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadManager, setUploadManager] = useState<VideoUploadManager | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0] || null);
      setError(null);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    try {
      // Create a unique idempotency key for this upload session
      const idempotencyKey = crypto.randomUUID();

      const totalParts = Math.ceil(file.size / (8 * 1024 * 1024));

      // 1. Create the submission and upload session simultaneously
      const response = await submissionsApi.create(
        {
          fileName: file.name,
          contentType: file.type || 'video/mp4',
          fileSize: file.size,
          totalParts,
        },
        idempotencyKey,
      );

      const { submissionId, uploadId } = response;

      // 2. Start the upload using the uploadId
      const source = new WebUploadSource(file);
      const manager = new VideoUploadManager({
        apiClient: apiClient,
        uploadId: uploadId,
        source,
        fileName: file.name,
        onProgress: (uploaded: number, total: number) => {
          setProgress(Math.round((uploaded / total) * 100));
        },
        onStateChange: (state: unknown) => {
          setStatus(state as string);
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onComplete: (videoId: string) => {
          setStatus('completed');
          console.warn('Upload complete, ID:', videoId);
          // Redirect to submission detail page
          window.location.href = `/dashboard/submissions/${submissionId}`;
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
    }
  };

  const handleRetry = async () => {
    if (uploadManager) {
      // Assuming VideoUploadManager has a retry mechanism,
      // or we just call start() again with existing state
      await uploadManager.start();
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold">Upload Video</h2>

      {!uploadManager && (
        <div className="space-y-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleStartUpload}
            disabled={!file}
            className="w-full rounded-lg bg-blue-600 py-2 text-white disabled:opacity-50"
          >
            Start Upload
          </button>
        </div>
      )}

      {uploadManager && (
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between">
              <span className="text-sm font-medium text-blue-700">Uploading {file?.name}</span>
              <span className="text-sm font-medium text-blue-700">{progress}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status: {status}</span>
            <div className="space-x-2">
              {status === 'error' && (
                <button onClick={handleRetry} className="text-blue-600 hover:underline">
                  Retry
                </button>
              )}
              {status !== 'completed' && status !== 'cancelled' && (
                <button onClick={handleCancel} className="text-red-600 hover:underline">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>
      )}
    </div>
  );
}
