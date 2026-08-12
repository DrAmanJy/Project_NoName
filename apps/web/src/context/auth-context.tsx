'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@repo/contracts';
import { authApi } from '@/lib/api-client';

export type UserRole = 'user' | 'employee' | 'admin';

export interface UserWithRole extends User {
  role?: UserRole;
}

interface AuthContextType {
  user: UserWithRole | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUser: boolean;
  isEmployee: boolean;
  isAdmin: boolean;
  hasRole: (allowedRoles: UserRole[]) => boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<number>(0);

  const role: UserRole = user?.role ?? 'user';
  const isUser = role === 'user';
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';

  const hasRole = useCallback(
    (allowedRoles: UserRole[]) => allowedRoles.includes(role),
    [role]
  );

  const fetchUser = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.me();
      if (currentRequestId !== requestIdRef.current) return;
      if (response.success && response.data?.user) {
        setUser(response.data.user as UserWithRole);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setUser(null);
      setError(err instanceof Error ? err.message : 'Failed to fetch user login data');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    requestIdRef.current++;
    setUser(null);
    setError(null);
    setIsLoading(false);
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        isUser,
        isEmployee,
        isAdmin,
        hasRole,
        error,
        refetch: fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
