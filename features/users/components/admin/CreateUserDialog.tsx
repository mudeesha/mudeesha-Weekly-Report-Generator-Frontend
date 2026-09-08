'use client';

import { useEffect, useId, useState } from 'react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Button, Input, Label, Select } from '@/components/ui/primitives';
import { createUser } from '@/services/user.service';
import { errorMessage } from '@/lib/api-client';
import { roleLabel } from '@/lib/format';
import type { UserRole } from '@/types';

const empty = { name: '', email: '', password: '', role: 'TEAM_MEMBER' as UserRole };
export function CreateUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => Promise<void> }) {
  const id = useId();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setForm({ ...empty }); setError(''); }, [open]);
  async function save() {
    if (saving) return;
    if (form.name.trim().length < 2) { setError('Enter a name of at least 2 characters.'); return; }
    setSaving(true); setError('');
    try {
      await createUser(form.name, form.email, form.password, form.role);
      setForm({ ...empty });
      onClose();
      toast.success('User created.');
      await onCreated();
    } catch (exception) { setError(errorMessage(exception)); }
    finally { setSaving(false); }
  }
  return <Dialog open={open} onClose={() => { if (!saving) onClose(); }} title="Add user" description="Create an active account with a name, email, password and role." size="sm" footer={<><Button size="sm" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button size="sm" type="submit" form={`${id}-form`} disabled={saving}>{saving ? 'Creating…' : 'Create user'}</Button></>}>
    <form id={`${id}-form`} onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-3">
      <div><Label htmlFor={`${id}-name`} required>Name</Label><Input id={`${id}-name`} value={form.name} required minLength={2} maxLength={150} disabled={saving} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} /></div>
      <div><Label htmlFor={`${id}-email`} required>Email</Label><Input id={`${id}-email`} type="email" value={form.email} required maxLength={255} autoComplete="off" disabled={saving} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} /></div>
      <div><Label htmlFor={`${id}-password`} required>Password</Label><Input id={`${id}-password`} type="password" value={form.password} required minLength={8} maxLength={128} autoComplete="new-password" disabled={saving} onChange={event => setForm(current => ({ ...current, password: event.target.value }))} /></div>
      <div><Label htmlFor={`${id}-role`}>Role</Label><Select id={`${id}-role`} value={form.role} disabled={saving} onChange={event => setForm(current => ({ ...current, role: event.target.value as UserRole }))}>{Object.entries(roleLabel).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</Select></div>
      {error && <p role="alert" className="text-[12px] text-error-700">{error}</p>}
    </form>
  </Dialog>;
}
