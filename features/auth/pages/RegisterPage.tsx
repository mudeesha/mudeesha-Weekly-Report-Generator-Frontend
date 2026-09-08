'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Navigate } from '@/lib/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as authApi from '@/services/auth.service';
import { errorMessage } from '@/lib/api-client';
import { AuthLayout } from '@/components/common/AuthLayout';
import { Button, HelperText, Input, Label } from '@/components/ui/primitives';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 2) {
      setError('Enter your full name (at least 2 characters).');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form.name, form.email, form.password);
      setDone(true);
      setForm(current => ({ ...current, password: '', confirm: '' }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return <AuthLayout>
    <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#3c3374]">Create account</h1>
    <p className="mt-1.5 text-[12px] text-[#887f9d]">New registrations start as Team Members.</p>
    {done ? (
      <div className="mt-6 rounded-[9px] border border-[#d9eee4] bg-[#f6fcf9] px-4 py-3">
        <p className="text-[12px] text-[#544c74]">Your account has been created. Sign in with your email and password.</p>
        <Link href="/login"><Button className="mt-3">Go to sign in</Button></Link>
      </div>
    ) : (
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div><Label htmlFor="name" required>Full name</Label><Input id="name" autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} minLength={2} maxLength={150} required /></div>
        <div><Label htmlFor="email" required>Email</Label><Input id="email" type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} maxLength={255} required /></div>
        <div>
          <Label htmlFor="password" required>Password</Label>
          <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={8} maxLength={128} required />
          <HelperText>Use 8–128 characters.</HelperText>
        </div>
        <div><Label htmlFor="confirm" required>Confirm password</Label><Input id="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required /></div>
        {error && <div role="alert"><HelperText error>{error}</HelperText></div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
      </form>
    )}
    <p className="mt-5 text-center text-[11px] text-[#887f9d]">Already have an account? <Link href="/login" className="font-medium text-[#594dba]">Sign in</Link></p>
  </AuthLayout>;
}
