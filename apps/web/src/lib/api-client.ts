import { ApiClient, createAuthApi, createVideosApi, createEarningsApi, createSubmissionsApi } from '@repo/api-client';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const API_URL = (() => {
  let url = RAW_API_URL.replace(/\/+$/, '');
  if (!url.endsWith('/api/v1')) {
    if (url.endsWith('/api')) {
      url = `${url}/v1`;
    } else {
      url = `${url}/api/v1`;
    }
  }
  return url;
})();

export const apiClient = new ApiClient({
  baseUrl: API_URL,
});

export const authApi = createAuthApi(apiClient);
export const videosApi = createVideosApi(apiClient);
export const earningsApi = createEarningsApi(apiClient);
export const submissionsApi = createSubmissionsApi(apiClient);
