import { ApiClient, createAuthApi, createVideosApi, createEarningsApi } from '@repo/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = new ApiClient({
  baseUrl: API_URL,
});

export const authApi = createAuthApi(apiClient);
export const videosApi = createVideosApi(apiClient);
export const earningsApi = createEarningsApi(apiClient);
