'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { UserRole } from '@/types';

export function RoleGuard({ children, allow }: { children: ReactNode; allow: UserRole[] }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const allowed = !!role && allow.includes(role);

  useEffect(() => {
    if (!loading && role && !allowed) router.replace('/dashboard');
  }, [allowed, loading, role, router]);

  if (loading || !allowed) return null;
  return <>{children}</>;
}
