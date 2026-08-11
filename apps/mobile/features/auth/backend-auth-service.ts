import type { User } from '@repo/contracts';
import type { AuthService, AuthProviderType } from './auth-types';
import { authApi, setSessionToken, clearSessionToken } from '../../lib/api';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { MockAuthService } from './mock-auth-service';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const mockService = new MockAuthService();

export class BackendAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await authApi.me();
      if (response.data?.user) {
        return response.data.user;
      }
    } catch {
      // Clear token on 401 or network error
      await clearSessionToken();
    }
    
    // Fallback to mock session if no backend session
    return mockService.getCurrentUser();
  }

  async signIn(provider: AuthProviderType): Promise<User> {
    if (provider !== 'google') {
      return mockService.signIn(provider);
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'noname',
      path: 'auth/callback',
    });

    let API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://project-no-name-api-rosy.vercel.app/api/v1';
    
    // Automatically rewrite localhost to 10.0.2.2 for Android emulator
    if (API_URL.includes('localhost') && Platform.OS === 'android') {
      API_URL = API_URL.replace('localhost', '10.0.2.2');
    }
    
    // Open the browser to the backend OAuth initiation route
    const authUrl = `${API_URL}/auth/google?client=mobile`;
    
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    if (result.type !== 'success') {
      throw new Error('OAuth login cancelled or failed');
    }

    // Extract the code from the redirect URL (React Native's URL doesn't support searchParams)
    const codeMatch = result.url.match(/[?&]code=([^&]+)/);
    const code = codeMatch ? codeMatch[1] : null;
    
    if (!code) {
      throw new Error('No handoff code received');
    }

    // Exchange the one-time code for a session token
    const exchangeResponse = await authApi.exchangeMobileHandoff(code);
    
    if (!exchangeResponse.success || !exchangeResponse.data?.sessionToken) {
      throw new Error('Failed to exchange handoff code for session token');
    }

    // Store the native session credential securely
    await setSessionToken(exchangeResponse.data.sessionToken);

    // Fetch and return the authenticated user
    const userResponse = await authApi.me();
    
    if (!userResponse.data?.user) {
      throw new Error('Failed to fetch user after authentication');
    }
    
    return userResponse.data.user;
  }

  async signOut(): Promise<void> {
    try {
      await authApi.logout();
    } finally {
      // Always delete local credential even if backend logout fails
      await clearSessionToken();
      await mockService.signOut();
    }
  }
}
