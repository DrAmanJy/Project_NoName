import { ApiClient, createAuthApi } from '@repo/api-client';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://project-no-name-api-rosy.vercel.app/api/v1';
const TOKEN_KEY = 'mobile_session_token';

export const apiClient = new ApiClient({
  baseUrl: API_URL,
  getAccessToken: async () => {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
});

export const authApi = createAuthApi(apiClient);

export async function setSessionToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
