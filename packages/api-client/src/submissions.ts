import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  SubmissionListResponse,
  SubmissionResponse,
} from '@repo/contracts';
import type { ApiClient } from './client';

export function createSubmissionsApi(client: ApiClient) {
  return {
    create(data: CreateSubmissionRequest, idempotencyKey: string): Promise<CreateSubmissionResponse> {
      return client.post<CreateSubmissionResponse>('/submissions', data, {
        headers: {
          'x-idempotency-key': idempotencyKey,
        },
      });
    },

    list(page = 1, limit = 20): Promise<SubmissionListResponse> {
      return client.get<SubmissionListResponse>(`/submissions?page=${page}&limit=${limit}`);
    },

    get(id: string): Promise<SubmissionResponse> {
      return client.get<SubmissionResponse>(`/submissions/${id}`);
    },
  };
}

export type SubmissionsApi = ReturnType<typeof createSubmissionsApi>;
