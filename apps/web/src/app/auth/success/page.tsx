'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard or home page after successful login
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-zinc-50" />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Completing login...
        </p>
      </div>
    </div>
  );
}
