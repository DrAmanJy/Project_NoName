'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User, Role } from '@repo/contracts';
import { authApi } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  isAuthenticated: boolean;
  isUser: boolean;
  isEmployee: boolean;
  isAdmin: boolean;
  hasRole: (allowedRoles: Role[]) => boolean;
  error: string | null;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<number>(0);

  const role: Role = user?.role ?? 'user';
  const isUser = role === 'user';
  const isEmployee = role === 'employee';
  const isAdmin = role === 'admin';

  const hasRole = useCallback(
    (allowedRoles: Role[]) => allowedRoles.includes(role),
    [role]
  );

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin && (pathname === '/' || pathname === '/login' || pathname === '/dashboard')) {
        router.push('/admin/dashboard');
      } else if (isEmployee && (pathname === '/' || pathname === '/login' || pathname === '/dashboard')) {
        router.push('/employees/dashboard');
      } else if (isUser && (pathname === '/' || pathname === '/login')) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, isAdmin, isEmployee, isUser, pathname, router]);

  const fetchUser = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.me();
      if (currentRequestId !== requestIdRef.current) return;
      if (response.success && response.data?.user) {
        setUser(response.data.user);
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
