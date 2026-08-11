'use client';

import React, { useState, useRef } from 'react';
import { VideoUploadManager } from '@repo/api-client';
import { WebUploadSource } from '@/features/video/web-upload-source';
import { apiClient } from '@/lib/api-client'; // Assume this exists or will be created

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
      const source = new WebUploadSource(file);
      const manager = new VideoUploadManager({
        apiClient: apiClient,
        source,
        fileName: file.name,
        onProgress: (uploaded: number, total: number) => {
          setProgress(Math.round((uploaded / total) * 100));
        },
        onStateChange: (state: any) => {
          setStatus(state);
        },
        onError: (err: Error) => {
          setError(err.message);
        },
        onComplete: (videoId: string) => {
          setStatus('completed');
          console.log('Upload complete, ID:', videoId);
        }
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
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Upload Video</h2>
      
      {!uploadManager && (
        <div className="space-y-4">
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            onClick={handleStartUpload}
            disabled={!file}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            Start Upload
          </button>
        </div>
      )}

      {uploadManager && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">Uploading {file?.name}</span>
              <span className="text-sm font-medium text-blue-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Status: {status}</span>
            <div className="space-x-2">
              {status === 'error' && (
                <button onClick={handleRetry} className="text-blue-600 hover:underline">Retry</button>
              )}
              {status !== 'completed' && status !== 'cancelled' && (
                <button onClick={handleCancel} className="text-red-600 hover:underline">Cancel</button>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
