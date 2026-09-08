'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Navigate, useNavigate, useSearchParams } from '@/lib/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Button, HelperText, Input, Label } from '@/components/ui/primitives';
import { AuthLayout } from '@/components/common/AuthLayout';
import { errorMessage } from '@/lib/api-client';

export function LoginPage() {
  const { isAuthenticated, loading: restoring, login, error: sessionError } = useAuth();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      const next = searchParams.get('next');
      navigate(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard', { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return <AuthLayout>
    <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#3c3374]">Sign in</h1>
    <p className="mt-1.5 text-[12px] text-[#887f9d]">Access your weekly reporting workspace.</p>
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
      </div>
      <div>
        <Label htmlFor="password" required>Password</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="pr-9" required />
          <button type="button" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#938ca2] hover:text-[#594dba]" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {(error || sessionError) && <div role="alert"><HelperText error>{error || sessionError}</HelperText></div>}
      <Button type="submit" className="w-full" disabled={loading || restoring}>{loading ? 'Signing in…' : restoring ? 'Checking session…' : 'Sign in'}</Button>
    </form>
    <div className="mt-6 border-t border-[#e7e5eb] pt-4">
      <div className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-[#594dba]" />
        <p className="text-[10px] leading-4 text-[#887f9d]">Your role and access are managed by your workspace administrator. Sessions expire automatically.</p>
      </div>
    </div>
    <p className="mt-5 text-center text-[11px] text-[#887f9d]">Don’t have an account? <Link href="/register" className="font-medium text-[#594dba]">Sign up</Link></p>
  </AuthLayout>;
}
