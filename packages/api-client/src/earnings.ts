import type { EarningsListResponse, EarningsSummary } from '@repo/contracts';
import type { ApiClient } from './client';

export function createEarningsApi(client: ApiClient) {
  return {
    list(page = 1, pageSize = 20): Promise<EarningsListResponse> {
      return client.get<EarningsListResponse>(`/earnings?page=${page}&pageSize=${pageSize}`);
    },

    summary(): Promise<EarningsSummary> {
      return client.get<EarningsSummary>('/earnings/summary');
    },
  };
}

export type EarningsApi = ReturnType<typeof createEarningsApi>;
