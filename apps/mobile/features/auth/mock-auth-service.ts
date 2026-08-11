import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { User } from '@repo/contracts';
import type { AuthService, AuthProviderType } from './auth-types';

const MOCK_SESSION_KEY = 'mock_session_active';
let webMockSessionActive = false;

const MOCK_USER: User = {
  id: 'mock-user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: undefined,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export class MockAuthService implements AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      if (Platform.OS === 'web') {
        return webMockSessionActive ? MOCK_USER : null;
      }
      const isSessionActive = await SecureStore.getItemAsync(MOCK_SESSION_KEY);
      if (isSessionActive === 'true') {
        return MOCK_USER;
      }
      return null;
    } catch (e) {
      console.error('Failed to get mock session', e);
      return null;
    }
  }

  async signIn(_provider: AuthProviderType): Promise<User> {
    try {
      if (Platform.OS === 'web') {
        webMockSessionActive = true;
        return MOCK_USER;
      }
      await SecureStore.setItemAsync(MOCK_SESSION_KEY, 'true');
      return MOCK_USER;
    } catch (e) {
      console.error('Failed to save mock session', e);
      throw new Error('Failed to sign in');
    }
  }

  async signOut(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        webMockSessionActive = false;
        return;
      }
      await SecureStore.deleteItemAsync(MOCK_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove mock session', e);
      throw new Error('Failed to sign out');
    }
  }
}
