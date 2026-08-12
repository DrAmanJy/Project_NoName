'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@repo/contracts';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  fallbackUrl?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackUrl = '/dashboard' }: RoleGuardProps) {
  const { user, role, isLoading, isAuthenticated } = useAuth();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center py-16 bg-white dark:bg-black text-zinc-900 dark:text-white">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Verifying access credentials...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 bg-white dark:bg-black text-zinc-900 dark:text-white">
        <div className="w-full max-w-md text-center rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            You must be signed in to access this internal portal page.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-xs font-bold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthorized Role State (User is logged in, but role is not allowed)
  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-6 bg-white dark:bg-black text-zinc-900 dark:text-white">
        <div className="w-full max-w-md text-center rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Your account role (<span className="font-bold uppercase text-red-600 dark:text-red-400">{role}</span>) does not have authorization to view this admin/employee portal.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={fallbackUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white px-6 py-2.5 text-xs font-bold text-white dark:text-zinc-900 shadow-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Role -> Render Protected Children
  return <>{children}</>;
}
