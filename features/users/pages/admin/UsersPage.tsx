'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, ShieldCheck, UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { errorMessage } from '@/lib/api-client';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, Badge, Button, Label, Select } from '@/components/ui/primitives';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { CreateUserDialog } from '@/features/users/components/admin/CreateUserDialog';
import { roleLabel } from '@/lib/format';
import type { User, UserRole } from '@/types';

export function UsersPage() {
  const { user: me, isAdmin } = useAuth();
  const { users, projects, loading, error, reload, changeUserRole, deactivateUser } = useData();
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [pendingRole, setPendingRole] = useState<UserRole>('TEAM_MEMBER');
  const [deleting, setDeleting] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const projectNames = (user: User) => user.projectIds.map(id => projects.find(project => project.id === id)?.name || `Project ${id}`).join(', ');
  const filtered = users.filter(user => (!roleFilter || user.role === roleFilter) && (!activeFilter || user.isActive === (activeFilter === 'active')));
  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className="flex items-center gap-2"><Avatar name={row.original.name} size="xs" /><span className="font-medium text-[#3e3759]">{row.original.name}</span></div> },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <span className="text-[11px]">{row.original.email}</span> },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <Badge tone={row.original.role === 'TEAM_MEMBER' ? 'neutral' : 'brand'}>{roleLabel[row.original.role]}</Badge> },
    { id: 'projects', header: 'Projects', accessorFn: projectNames, cell: ({ row }) => <p className="max-w-[260px] truncate text-[11px]" title={projectNames(row.original)}>{projectNames(row.original) || '—'}</p> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <Badge tone={row.original.isActive ? 'success' : 'neutral'}>{row.original.isActive ? 'Active' : 'Inactive'}</Badge> },
    { id: 'actions', header: 'Actions', cell: ({ row: { original: item } }) => item.id === me?.id ? <span className="text-[10px] text-[#817a92]">Current user</span> : isAdmin ? <div className="flex justify-end gap-1">
      <button type="button" className="wr-action" disabled={saving} title="Change role" aria-label={`Change role for ${item.name}`} onClick={() => { setRoleUser(item); setPendingRole(item.role); }}><Pencil className="h-3.5 w-3.5" /></button>
      {item.isActive && <button type="button" className="wr-action wr-action-danger" disabled={saving} title="Deactivate user" aria-label={`Deactivate ${item.name}`} onClick={() => setDeleting(item)}><UserX className="h-3.5 w-3.5" /></button>}
    </div> : <span className="text-[10px] text-[#817a92]">Read only</span> },
  ];
  return <>
    <PageHeader title="Users" subtitle="Manage workspace roles and account access." crumbs={[{ label: 'Users' }]} actions={isAdmin && <Button size="sm" onClick={() => setCreateOpen(true)}><UserPlus className="h-3.5 w-3.5" />Add User</Button>} />
    <DataTable label="Users" data={filtered} columns={columns} getRowId={user => user.id} minWidth={850} loading={loading} error={error} onRetry={() => void reload()} searchText={user => `${user.name} ${user.email} ${roleLabel[user.role]} ${projectNames(user)}`} searchPlaceholder="Search name or email…" resetKey={`${roleFilter}:${activeFilter}`} onReset={() => { setRoleFilter(''); setActiveFilter(''); }} filters={<>
      <TableFilter label="Filter by role" value={roleFilter} onChange={setRoleFilter}><option value="">All roles</option>{Object.entries(roleLabel).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</TableFilter>
      <TableFilter label="Account status" value={activeFilter} onChange={setActiveFilter}><option value="">All accounts</option><option value="active">Active</option><option value="inactive">Inactive</option></TableFilter>
    </>} />
    {isAdmin && <>
      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={reload} />
      <Dialog open={!!roleUser} onClose={() => { if (!saving) setRoleUser(null); }} title="Change role" description={`Update permissions for ${roleUser?.name || ''}.`} size="sm" footer={<><Button size="sm" variant="outline" disabled={saving} onClick={() => setRoleUser(null)}>Cancel</Button><Button size="sm" disabled={saving} onClick={async () => {
        if (!roleUser || saving) return;
        setSaving(true);
        try { await changeUserRole(roleUser.id, pendingRole); setRoleUser(null); toast.success('Role updated.'); }
        catch (exception) { toast.error(errorMessage(exception)); }
        finally { setSaving(false); }
      }}>Update role</Button></>}>
        <Label htmlFor="pending-role">Role</Label><Select id="pending-role" value={pendingRole} disabled={saving} onChange={event => setPendingRole(event.target.value as UserRole)}>{Object.entries(roleLabel).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</Select>
        <p className="mt-3 flex gap-2 text-[11px] text-[#817a92]"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Managers review reports. Only Admins manage accounts and roles.</p>
      </Dialog>
      <ConfirmDialog open={!!deleting} onClose={() => { if (!saving) setDeleting(null); }} title="Deactivate user" description={`Deactivate ${deleting?.name || ''}? Their reports stay intact, but sign-in and existing access tokens are blocked.`} confirmLabel="Deactivate" loading={saving} onConfirm={async () => {
        if (!deleting || saving) return;
        setSaving(true);
        try { await deactivateUser(deleting.id); setDeleting(null); toast.success('User deactivated.'); }
        catch (exception) { toast.error(errorMessage(exception)); }
        finally { setSaving(false); }
      }} />
    </>}
  </>;
}
