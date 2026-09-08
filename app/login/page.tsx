import { Suspense } from 'react';
import { LoginPage } from '@/features/auth/pages/LoginPage';
export default function Page() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading…</div>}><LoginPage /></Suspense>;
}
