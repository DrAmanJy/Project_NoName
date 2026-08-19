import type { AdminVideoItem } from "./video-review-console";


export function VideoMetadata({ selectedVideo }: { selectedVideo: AdminVideoItem }) {

    return (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Submission & File Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 min-w-0">
                    <div className="truncate">
                        <span className="text-zinc-500">Video Title: </span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                            {selectedVideo.title}
                        </span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Submission Status: </span>
                        <span className={`font-bold uppercase ${selectedVideo.status?.toLowerCase() === 'cancelled' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                            {selectedVideo.status}
                        </span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Video Stage: </span>
                        <span className={`font-bold capitalize ${(selectedVideo.video?.uploadStatus || 'uploaded').toLowerCase() === 'cancelled' ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                            {selectedVideo.video?.uploadStatus || 'uploaded'}
                        </span>
                    </div>
                    <div className="truncate">
                        <span className="text-zinc-500">Creator Name: </span>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {selectedVideo.userName} ({selectedVideo.userEmail})
                        </span>
                    </div>
                    <div className="truncate">
                        <span className="text-zinc-500">Creator User ID: </span>
                        <span className="font-mono text-zinc-400">
                            {selectedVideo.userId}
                        </span>
                    </div>
                </div>

                <div className="space-y-2 min-w-0">
                    <div>
                        <span className="text-zinc-500">Cloudflare R2 Key: </span>
                        <span className="font-mono text-[11px] text-zinc-400 break-all">
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
                <div className="mt-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-500 mb-1">
                        <span>LAST REVIEW NOTES</span>
                        <span>{selectedVideo.reviewedAt}</span>
                    </div>
                    <p className="text-xs text-zinc-800 dark:text-zinc-200 italic">
                        &quot;{selectedVideo.reviewNotes}&quot;
                    </p>
                </div>
            )}
        </div>
    )
}