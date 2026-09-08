'use client';

import { FolderKanban, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { ErrorState, TableSkeleton } from '@/components/common/states';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, Badge, Card } from '@/components/ui/primitives';
import { roleLabel } from '@/lib/format';

export function ProfilePage() {
  const { user } = useAuth();
  const { projects, loading, error, reload } = useData();

  if (!user) return null;
  if (error) return <ErrorState description={error} onRetry={() => void reload()} />;
  if (loading) return <TableSkeleton rows={3} />;

  const assigned = projects.filter(project => project.members.some(member => member.userId === user.id));

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your account information and current project assignments." crumbs={[{ label: 'Profile' }]} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#ece9f0] px-5 py-5 sm:flex-row sm:items-center">
          <Avatar name={user.name} size="xl" />
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold text-[#393353]">{user.name}</h2>
            <p className="mt-1 text-[11px] text-[#817a92]">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="brand">{roleLabel[user.role]}</Badge>
              <Badge tone="success">Active</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-2">
          <section className="border-b border-[#ece9f0] p-5 xl:border-b-0 xl:border-r">
            <h3 className="text-[13px] font-semibold text-[#393353]">Personal Information</h3>
            <dl className="mt-4 divide-y divide-[#efedf2]">
              <div className="grid grid-cols-[110px_1fr] gap-4 py-3">
                <dt className="text-[10px] text-[#938ca2]">Full name</dt>
                <dd className="text-[12px] font-medium text-[#4e4769]">{user.name}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-4 py-3">
                <dt className="text-[10px] text-[#938ca2]">Email</dt>
                <dd className="break-all text-[12px] font-medium text-[#4e4769]">{user.email}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-4 py-3">
                <dt className="text-[10px] text-[#938ca2]">Role</dt>
                <dd className="text-[12px] font-medium text-[#4e4769]">{roleLabel[user.role]}</dd>
              </div>
            </dl>
          </section>

          <section className="p-5">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#594dba]" />
              <h3 className="text-[13px] font-semibold text-[#393353]">Assigned Projects</h3>
            </div>
            {assigned.length ? (
              <div className="mt-4 divide-y divide-[#efedf2] border-y border-[#efedf2]">
                {assigned.map(project => (
                  <div key={project.id} className="py-3">
                    <p className="text-[12px] font-medium text-[#4e4769]">{project.name}</p>
                    {project.description && <p className="mt-1 text-[10px] leading-4 text-[#938ca2]">{project.description}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="mt-4 text-[11px] text-[#938ca2]">No projects assigned.</p>}
          </section>
        </div>

        <div className="border-t border-[#ece9f0] bg-[#faf9fd] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-2.5">
              <LockKeyhole className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#594dba]" />
              <div>
                <h3 className="text-[12px] font-semibold text-[#393353]">Account Security</h3>
                <p className="mt-1 max-w-3xl text-[10px] leading-4 text-[#817a92]">Profile editing and password changes are not available from the current backend. Contact an administrator for account changes.</p>
              </div>
            </div>
            <a href="mailto:admin@example.com" className="inline-flex h-8 items-center gap-1.5 self-start rounded-[6px] border border-[#d9d5e5] bg-white px-3 text-[11px] font-medium text-[#594dba] hover:bg-[#f4f1fb]"><Mail className="h-3.5 w-3.5" />Contact admin</a>
          </div>
        </div>
      </Card>
    </>
  );
}
