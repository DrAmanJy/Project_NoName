import type {
  CreateVideoRequest,
  UploadUrlResponse,
  Video,
  VideoListResponse,
} from '@repo/contracts';
import type { ApiClient } from './client';

export function createVideosApi(client: ApiClient) {
  return {
    list(page = 1, pageSize = 20): Promise<VideoListResponse> {
      return client.get<VideoListResponse>(`/videos?page=${page}&pageSize=${pageSize}`);
    },

    getById(id: string): Promise<Video> {
      return client.get<Video>(`/videos/${id}`);
    },

    requestUploadUrl(data: CreateVideoRequest): Promise<UploadUrlResponse> {
      return client.post<UploadUrlResponse>('/videos/upload-url', data);
    },

    confirmUpload(fileKey: string): Promise<Video> {
      return client.post<Video>('/videos/confirm-upload', { fileKey });
    },
  };
}

export type VideosApi = ReturnType<typeof createVideosApi>;
