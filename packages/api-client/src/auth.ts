import type { AuthResponse } from '@repo/contracts';
import type { ApiClient } from './client';

export function createAuthApi(client: ApiClient) {
  return {
    logout(): Promise<void> {
      return client.post<void>('/auth/logout');
    },

    me(): Promise<AuthResponse> {
      return client.get<AuthResponse>('/auth/me');
    },

    exchangeMobileHandoff(code: string): Promise<{ success: boolean; data: { sessionToken: string } }> {
      return client.post('/auth/mobile/exchange', { code });
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
