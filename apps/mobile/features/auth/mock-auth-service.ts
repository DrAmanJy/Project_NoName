import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@repo/contracts';
import type { AuthService, AuthProviderType } from './auth-types';

const MOCK_SESSION_KEY = '@mock_session_active';

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
      const isSessionActive = await AsyncStorage.getItem(MOCK_SESSION_KEY);
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
      await AsyncStorage.setItem(MOCK_SESSION_KEY, 'true');
      return MOCK_USER;
    } catch (e) {
      console.error('Failed to save mock session', e);
      throw new Error('Failed to sign in');
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    } catch (e) {
      console.error('Failed to remove mock session', e);
      throw new Error('Failed to sign out');
    }
  }
}
