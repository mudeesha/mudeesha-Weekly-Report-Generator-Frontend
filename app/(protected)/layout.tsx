import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AuthGuard } from '@/components/navigation/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading your workspace…</div>}>
      <AuthGuard><AppShell>{children}</AppShell></AuthGuard>
    </Suspense>
  );
}
