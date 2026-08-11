import React from 'react';
import { VideoUploader } from '@/components/video/VideoUploader';

export default function UploadVideoPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Upload Video</h1>
      <VideoUploader />
    </div>
  );
}
