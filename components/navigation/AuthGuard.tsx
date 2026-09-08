'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ErrorState } from '@/components/common/states';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, error, refreshUser } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && !(error && !error.includes('session'))) {
      const query = searchParams.toString();
      const next = `${pathname}${query ? `?${query}` : ''}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [error, isAuthenticated, loading, pathname, router, searchParams]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-500" role="status">Loading your workspace…</div>;
  if (error && !isAuthenticated && !error.includes('session')) return <div className="m-8"><ErrorState description={error} onRetry={() => void refreshUser()} /></div>;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
