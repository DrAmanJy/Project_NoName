import type { AdminVideoItem } from './video-review-console';
import type { VideoUploadStatus, VideoVerificationStatus } from '@repo/contracts';

export function VideoMetadata({ selectedVideo }: { selectedVideo: AdminVideoItem }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-bold tracking-wider text-zinc-400 uppercase">
        Submission & File Metadata
      </h3>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        <div className="space-y-2">
          <div>
            <span className="text-zinc-500">Video Title: </span>
            <span className="font-bold text-zinc-900 dark:text-white">{selectedVideo.title}</span>
          </div>
          <div>
            <span className="text-zinc-500">Creator Name: </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {selectedVideo.userName} ({selectedVideo.userEmail})
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Creator User ID: </span>
            <span className="font-mono text-zinc-400">{selectedVideo.userId}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="text-zinc-500">Cloudflare R2 Key: </span>
            <span className="font-mono text-[11px] break-all text-zinc-400">
              {selectedVideo.fileKey}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">File Format & Size: </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {selectedVideo.mimeType} • {selectedVideo.fileSizeFormatted}
            </span>
          </div>
          <div>
            <span className="text-zinc-500">Uploaded Timestamp: </span>
            <span className="font-semibold text-zinc-900 dark:text-white">
              {selectedVideo.createdAtFormatted}
            </span>
          </div>
        </div>
      </div>

      {selectedVideo.reviewNotes && (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-1 flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>LAST REVIEW NOTES</span>
            <span>{selectedVideo.reviewedAt}</span>
          </div>
          <p className="text-xs text-zinc-800 italic dark:text-zinc-200">
            &quot;{selectedVideo.reviewNotes}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
