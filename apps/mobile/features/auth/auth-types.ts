import type { User } from '@repo/contracts';

export type AuthProviderType = 'google' | 'facebook' | 'apple';

export interface AuthService {
  getCurrentUser(): Promise<User | null>;
  signIn(provider: AuthProviderType): Promise<User>;
  signOut(): Promise<void>;
}
