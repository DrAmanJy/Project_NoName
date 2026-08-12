'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@repo/contracts';
import { authApi } from '@/lib/api-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef<number>(0);

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
    } catch (err: any) {
      if (currentRequestId !== requestIdRef.current) return;
      setUser(null);
      // Ignore 401 errors for authApi.me() as it's the expected state when not logged in
      if (err?.status !== 401) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user login data');
      }
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch: fetchUser,
    logout,
  };
}
