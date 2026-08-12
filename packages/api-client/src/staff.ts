import type { ApiClient } from './client.js';
import type {
  StaffSubmissionListResponse,
  StaffSubmissionDetailResponse,
  UpdateSubmissionStatusRequest
} from '@repo/contracts';

export function createStaffApi(client: ApiClient) {
  return {
    submissions: {
      list: (page = 1, limit = 10, status?: string) => {
        const query = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) query.append('status', status);
        return client.get<StaffSubmissionListResponse>(`/staff/submissions?${query}`);
      },
      get: (id: string) => client.get<StaffSubmissionDetailResponse>(`/staff/submissions/${id}`),
      updateStatus: (id: string, data: UpdateSubmissionStatusRequest) => client.patch<void>(`/staff/submissions/${id}`, data),
    }
  };
}

export type StaffApi = ReturnType<typeof createStaffApi>;
