'use client';

import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { DataProvider } from '@/providers/DataProvider';
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <DataProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </DataProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
