import type {
  CreateVideoUploadInput,
  CreateVideoUploadResponse,
  MultipartSignRequestInput,
  MultipartSignResponse,
  MultipartCompleteRequestInput,
} from '@repo/contracts';
import type { ApiClient } from './client';

export function createVideosApi(client: ApiClient) {
  return {
    createUpload(data: CreateVideoUploadInput): Promise<CreateVideoUploadResponse> {
      return client.post<CreateVideoUploadResponse>('/videos/uploads', data);
    },

    signParts(uploadId: string, data: MultipartSignRequestInput): Promise<MultipartSignResponse> {
      return client.post<MultipartSignResponse>(`/videos/uploads/${uploadId}/sign-parts`, data);
    },

    completeUpload(uploadId: string, data: MultipartCompleteRequestInput): Promise<void> {
      return client.post<void>(`/videos/uploads/${uploadId}/complete`, data);
    },

    cancelUpload(uploadId: string): Promise<void> {
      return client.post<void>(`/videos/uploads/${uploadId}/cancel`);
    },

    getUpload(uploadId: string): Promise<unknown> {
      // Returning 'unknown' for now since specific interface might not exist in contracts for status yet,
      // or we can use a basic Record<string, unknown>.
      return client.get<unknown>(`/videos/${uploadId}`);
    },

    getVerification(uploadId: string): Promise<unknown> {
      return client.get<unknown>(`/videos/${uploadId}/verification`);
    },
  };
}

export type VideosApi = ReturnType<typeof createVideosApi>;
