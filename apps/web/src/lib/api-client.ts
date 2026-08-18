import { ApiClient, createAuthApi, createVideosApi, createEarningsApi, createSubmissionsApi, createStaffApi, createAdminApi } from '@repo/api-client';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;

// When NEXT_PUBLIC_API_URL is empty, requests go to /api/v1 on the same origin.
// Next.js rewrites proxy those to the real API server-side (see next.config.ts).
// When set to an absolute URL (local dev without proxy), use it directly.
export const API_URL = (() => {
  if (!RAW_API_URL) return '/api/v1';
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
  credentials: 'include',
});

export const authApi = createAuthApi(apiClient);
export const videosApi = createVideosApi(apiClient);
export const earningsApi = createEarningsApi(apiClient);
export const submissionsApi = createSubmissionsApi(apiClient);
export const staffApi = createStaffApi(apiClient);
export const adminApi = createAdminApi(apiClient);
