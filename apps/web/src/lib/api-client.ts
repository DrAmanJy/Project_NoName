import { ApiClient } from '@repo/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = new ApiClient({
  baseUrl: API_URL,
});
