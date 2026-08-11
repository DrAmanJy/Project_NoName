import type { AuthResponse, LoginRequest, RegisterRequest } from '@repo/contracts';
import type { ApiClient } from './client';

export function createAuthApi(client: ApiClient) {
  return {
    login(data: LoginRequest): Promise<AuthResponse> {
      return client.post<AuthResponse>('/auth/login', data);
    },

    register(data: RegisterRequest): Promise<AuthResponse> {
      return client.post<AuthResponse>('/auth/register', data);
    },

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
