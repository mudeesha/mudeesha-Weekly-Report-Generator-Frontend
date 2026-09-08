'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Avatar, Badge, Button, Input } from '@/components/ui/primitives';
import { roleLabel } from '@/lib/format';
import type { Project, User } from '@/types';
export function ManageMembersDialog({ open, project, users, saving, onClose, onSave }: {
  open: boolean;
  project: Project | null;
  users: User[];
  saving: boolean;
  onClose: () => void;
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    if (open) {
      setSelected(project?.members.map(m => m.userId) || []);
      setSearch('');
    }
  }, [open, project]);
  return <Dialog
    open={open}
    onClose={() => {
      if (!saving)
        onClose();
    }}
    title="Manage project members"
    description={`${project?.name || ''} · This replaces the assigned member list.`}
    footer={<>
      <Button variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
      <Button disabled={saving} onClick={() => void onSave(selected)}>
        {saving ? 'Saving…' : 'Save members'}
      </Button>
    </>}>
    <Input aria-label="Search members" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
    <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
      {users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())).map(user => <label key={user.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
        <input
          type="checkbox"
          checked={selected.includes(user.id)}
          disabled={!user.isActive && !selected.includes(user.id)}
          onChange={e => setSelected(ids => e.target.checked ? [...ids, user.id] : ids.filter(id => id !== user.id))}
          className="h-4 w-4 accent-brand-500" />
        <Avatar name={user.name} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-800">
            {user.name}
          </span>
          <span className="block truncate text-xs text-gray-500">
            {user.email}
          </span>
        </span>
        <Badge tone={user.isActive ? 'neutral' : 'warning'}>
          {user.isActive ? roleLabel[user.role] : 'Inactive'}
        </Badge>
      </label>)}
    </div>
    <p className="mt-4 text-xs text-gray-500">{selected.length} selected. Inactive members can be removed, but cannot be newly assigned here.</p>
  </Dialog>;
}
