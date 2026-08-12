import type {
  CreateVideoUploadInput,
  CreateVideoUploadResponse,
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
  source: UploadSource;
  fileName: string;
  title?: string;
  description?: string;
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
}

export class VideoUploadManager {
  private readonly apiClient: ApiClient;
  private readonly source: UploadSource;
  private readonly fileName: string;
  private readonly title?: string;
  private readonly description?: string;
  private readonly partSize: number;
  private readonly concurrency: number;
  private readonly onProgress?: (bytesUploaded: number, totalBytes: number) => void;
  private readonly onStateChange?: (state: 'created' | 'uploading' | 'paused' | 'completed' | 'error' | 'cancelled') => void;
  private readonly onError?: (error: Error) => void;
  private readonly onComplete?: (videoId: string) => void;

  private uploadId: string | null = null;
  private multipartUploadId: string | null = null;
  private objectKey: string | null = null;
  
  private parts: PartState[] = [];
  private activeUploads = 0;
  private isPaused = false;
  private isCancelled = false;
  private bytesUploaded = 0;

  constructor(options: VideoUploadManagerOptions) {
    this.apiClient = options.apiClient;
    this.source = options.source;
    this.fileName = options.fileName;
    this.title = options.title;
    this.description = options.description;
    this.partSize = options.partSize || 8 * 1024 * 1024;
    this.concurrency = options.concurrency || 4;
    
    this.onProgress = options.onProgress;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
    this.onComplete = options.onComplete;
  }

  /**
   * Resumes an existing upload or starts a new one if uploadId is not provided.
   */
  public async start(existingUploadId?: string, existingMultipartUploadId?: string, existingObjectKey?: string, completedParts?: { partNumber: number, eTag: string }[]) {
    try {
      this.isPaused = false;
      this.isCancelled = false;

      if (existingUploadId && existingMultipartUploadId && existingObjectKey) {
        this.uploadId = existingUploadId;
        this.multipartUploadId = existingMultipartUploadId;
        this.objectKey = existingObjectKey;
        this.initializeParts(completedParts || []);
      } else {
        await this.createUploadSession();
        this.initializeParts([]);
      }

      this.setState('uploading');
      this.uploadNextParts();
    } catch (err) {
      this.handleError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  /**
   * Retries an upload session without recreating the session or wiping progress,
   * unless the upload was cancelled.
   */
  public async retry() {
    if (this.isCancelled || !this.uploadId) {
      this.uploadId = null;
      this.multipartUploadId = null;
      this.objectKey = null;
      return this.start();
    }
    this.isPaused = false;
    this.isCancelled = false;
    for (const part of this.parts) {
      if (part.status === 'failed') {
        part.status = 'pending';
        part.retryCount = 0;
      }
    }
    this.setState('uploading');
    this.uploadNextParts();
  }

  public pause() {
    this.isPaused = true;
    this.setState('paused');
  }

  public async cancel() {
    this.isCancelled = true;
    this.setState('cancelled');
    if (this.uploadId) {
      try {
        await this.apiClient.post(`/videos/uploads/${this.uploadId}/cancel`);
      } catch (err) {
        console.error('Failed to cancel upload on server:', err);
      }
    }
  }

  private async createUploadSession() {
    const totalParts = Math.ceil(this.source.size / this.partSize);
    
    const request: CreateVideoUploadInput = {
      fileName: this.fileName,
      contentType: this.source.contentType,
      fileSize: this.source.size,
      totalParts,
      title: this.title,
      description: this.description,
    };

    const response = await this.apiClient.post<CreateVideoUploadResponse>('/videos/uploads', request);
    this.uploadId = response.uploadId;
    this.multipartUploadId = response.multipartUploadId;
    this.objectKey = response.objectKey;
    this.setState('created');
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
      });

      if (eTag) {
        this.bytesUploaded += length;
      }
    }
    
    if (this.onProgress) {
      this.onProgress(this.bytesUploaded, this.source.size);
    }
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
      
      const response = await fetch(url, {
        method: 'PUT',
        body: chunk.data,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let eTag = response.headers.get('ETag');
      if (!eTag) {
        // R2 usually returns ETag, but if missing it's a problem
        eTag = 'MISSING_ETAG'; 
      }
      
      part.eTag = eTag.replace(/"/g, '');
      part.status = 'completed';
      this.bytesUploaded += part.length;
      
      if (this.onProgress) {
        this.onProgress(this.bytesUploaded, this.source.size);
      }
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
