import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { User } from '@repo/contracts';
import type { AuthService, AuthProviderType } from './auth-types';
import { MockAuthService } from './mock-auth-service';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null };

interface AuthContextValue {
  status: AuthState['status'];
  user: User | null;
  signIn: (provider: AuthProviderType) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Factory function to get the correct auth service based on env
function getAuthService(): AuthService {
  const authMode = process.env.EXPO_PUBLIC_AUTH_MODE || 'mock';
  
  if (authMode === 'mock') {
    return new MockAuthService();
  }
  
  // Future: return new BackendAuthService();
  return new MockAuthService();
}

const authService = getAuthService();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null });

  const loadAuthSession = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setAuthState({ status: 'authenticated', user });
      } else {
        setAuthState({ status: 'unauthenticated', user: null });
      }
    } catch {
      setAuthState({ status: 'unauthenticated', user: null });
    }
  }, []);

  useEffect(() => {
    loadAuthSession();
  }, [loadAuthSession]);

  const signIn = useCallback(async (provider: AuthProviderType) => {
    try {
      const user = await authService.signIn(provider);
      setAuthState({ status: 'authenticated', user });
    } catch (error) {
      // Handle error if needed
      console.error(error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
      setAuthState({ status: 'unauthenticated', user: null });
    } catch {
      setAuthState({ status: 'unauthenticated', user: null });
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await loadAuthSession();
  }, [loadAuthSession]);

  const value = useMemo<AuthContextValue>(() => ({
    status: authState.status,
    user: authState.user,
    signIn,
    signOut,
    refreshAuth,
  }), [authState, signIn, signOut, refreshAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
