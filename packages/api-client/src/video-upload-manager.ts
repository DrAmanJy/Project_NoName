import type {
  MultipartSignRequestInput,
  MultipartSignResponse,
  MultipartCompleteRequestInput,
} from '@repo/contracts';
import type { ApiClient } from './client.js';

export interface UploadChunk {
  data: Blob;
}

export interface UploadSource {
  size: number;
  contentType: string;
  readPart(partNumber: number, offset: number, length: number): Promise<UploadChunk>;
}

export interface VideoUploadManagerOptions {
  apiClient: ApiClient;
  uploadId: string;
  source: UploadSource;
  fileName: string;
  partSize?: number; // Default 8MB
  concurrency?: number; // Default 4
  onProgress?: (bytesUploaded: number, totalBytes: number) => void;
  onStateChange?: (state: 'created' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled') => void;
  onError?: (error: Error) => void;
  onComplete?: (videoId: string) => void;
}

interface PartState {
  partNumber: number;
  offset: number;
  length: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  eTag?: string;
  retryCount: number;
  bytesUploaded?: number;
}

export class VideoUploadManager {
  private readonly apiClient: ApiClient;
  private readonly uploadId: string;
  private readonly source: UploadSource;
  private readonly fileName: string;
  private readonly partSize: number;
  private readonly concurrency: number;
  private readonly onProgress?: (bytesUploaded: number, totalBytes: number) => void;
  private readonly onStateChange?: (state: 'created' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled') => void;
  private readonly onError?: (error: Error) => void;
  private readonly onComplete?: (videoId: string) => void;
  
  private parts: PartState[] = [];
  private activeUploads = 0;
  private isPaused = false;
  private isCancelled = false;
  private bytesUploaded = 0;

  constructor(options: VideoUploadManagerOptions) {
    this.apiClient = options.apiClient;
    this.uploadId = options.uploadId;
    this.source = options.source;
    this.fileName = options.fileName;
    this.partSize = options.partSize || 8 * 1024 * 1024;
    this.concurrency = options.concurrency || 4;
    
    this.onProgress = options.onProgress;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
    this.onComplete = options.onComplete;
  }

  /**
   * Resumes an existing upload or starts a new one based on the initialized uploadId.
   */
  public async start(completedParts?: { partNumber: number, eTag: string }[]) {
    try {
      this.isPaused = false;
      this.isCancelled = false;

      if (completedParts) {
        this.initializeParts(completedParts);
      } else if (this.parts.length === 0) {
        this.initializeParts([]);
      }

      this.setState('uploading');
      this.uploadNextParts();
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  public pause() {
    this.isPaused = true;
    this.setState('paused');
  }

  public async cancel() {
    this.isCancelled = true;
    this.setState('cancelled');
    try {
      await this.apiClient.post(`/videos/uploads/${this.uploadId}/cancel`);
    } catch (err) {
      console.error('Failed to cancel upload on server:', err);
    }
  }

  private initializeParts(completedParts: { partNumber: number, eTag: string }[]) {
    this.parts = [];
    this.bytesUploaded = 0;
    
    const totalParts = Math.ceil(this.source.size / this.partSize);
    const completedMap = new Map(completedParts.map(p => [p.partNumber, p.eTag]));

    for (let i = 0; i < totalParts; i++) {
      const partNumber = i + 1;
      const offset = i * this.partSize;
      const length = Math.min(this.partSize, this.source.size - offset);
      
      const eTag = completedMap.get(partNumber);
      
      this.parts.push({
        partNumber,
        offset,
        length,
        status: eTag ? 'completed' : 'pending',
        eTag,
        retryCount: 0,
        bytesUploaded: eTag ? length : 0,
      });

      if (eTag) {
        this.bytesUploaded += length;
      }
    }
    
    this.reportProgress();
  }

  private reportProgress() {
    if (!this.onProgress) return;
    const totalUploaded = this.parts.reduce((sum, p) => sum + (p.status === 'completed' ? p.length : (p.bytesUploaded || 0)), 0);
    this.onProgress(Math.min(totalUploaded, this.source.size), this.source.size);
  }

  private async uploadNextParts() {
    if (this.isPaused || this.isCancelled) return;

    const pendingParts = this.parts.filter(p => p.status === 'pending');
    
    if (pendingParts.length === 0 && this.activeUploads === 0) {
      const hasFailed = this.parts.some(p => p.status === 'failed');
      if (hasFailed) {
        this.handleError(new Error('Upload failed: some parts failed to upload after retries.'));
      } else {
        await this.completeUpload();
      }
      return;
    }

    const availableSlots = this.concurrency - this.activeUploads;
    if (availableSlots <= 0 || pendingParts.length === 0) return;

    const partsToUpload = pendingParts.slice(0, availableSlots);
    
    // Batch sign the parts
    try {
      const signRequest: MultipartSignRequestInput = {
        partNumbers: partsToUpload.map(p => p.partNumber)
      };
      const signResponse = await this.apiClient.post<MultipartSignResponse>(`/videos/uploads/${this.uploadId}/sign-parts`, signRequest);
      
      const urlMap = new Map(signResponse.presignedUrls.map(u => [u.partNumber, u.url]));

      for (const part of partsToUpload) {
        part.status = 'uploading';
        this.activeUploads++;
        
        const url = urlMap.get(part.partNumber);
        if (!url) {
          throw new Error(`Did not receive presigned URL for part ${part.partNumber}`);
        }

        this.uploadPart(part, url).catch(err => {
          console.error(`Error uploading part ${part.partNumber}:`, err);
        });
      }
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private async uploadPart(part: PartState, url: string) {
    try {
      if (this.isPaused || this.isCancelled) {
        part.status = 'pending';
        this.activeUploads--;
        return;
      }

      const chunk = await this.source.readPart(part.partNumber, part.offset, part.length);
      
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', url);
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            part.bytesUploaded = Math.min(e.loaded, part.length);
            this.reportProgress();
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let eTag = xhr.getResponseHeader('ETag');
            if (!eTag) {
              eTag = 'MISSING_ETAG'; 
            }
            part.eTag = eTag.replace(/"/g, '');
            part.status = 'completed';
            part.bytesUploaded = part.length;
            this.reportProgress();
            resolve();
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.onabort = () => reject(new Error('Aborted'));
        
        xhr.send(chunk.data);
      });
    } catch {
      part.retryCount++;
      if (part.retryCount > 3) {
        part.status = 'failed';
      } else {
        part.status = 'pending'; // Queue for retry
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, part.retryCount) * 1000));
      }
    } finally {
      this.activeUploads--;
      this.uploadNextParts();
    }
  }

  private async completeUpload() {
    try {
      const request: MultipartCompleteRequestInput = {
        parts: this.parts.map(p => ({
          partNumber: p.partNumber,
          eTag: p.eTag!,
        })),
      };

      await this.apiClient.post(`/videos/uploads/${this.uploadId}/complete`, request);
      this.setState('completed');
      if (this.onComplete && this.uploadId) {
        this.onComplete(this.uploadId);
      }
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  private setState(state: 'created' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled') {
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  private handleError(error: Error) {
    this.isPaused = true; // Stop active scheduling
    this.setState('error');
    if (this.onError) {
      this.onError(error);
    }
  }
}
