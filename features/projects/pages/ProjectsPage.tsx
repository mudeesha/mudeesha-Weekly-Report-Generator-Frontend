'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { SafeNotes } from '@/features/reports/components/shared/ReportText';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/providers/DataProvider';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, Badge, Button } from '@/components/ui/primitives';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { ProjectDialog } from '@/features/projects/components/admin/ProjectDialog';
import { ManageMembersDialog } from '@/features/projects/components/admin/ManageMembersDialog';
import { errorMessage } from '@/lib/api-client';
import type { Project, ProjectInput } from '@/types';

export function ProjectsPage() {
  const { projects, users, loading, error, reload, createProject, updateProject, deleteProject, assignMembers } = useData();
  const { isManager, user } = useAuth();
  const [viewing, setViewing] = useState<Project | null>(null);
  const [assignment, setAssignment] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [membersFor, setMembersFor] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(data: ProjectInput) {
    setSaving(true);
    try {
      if (editing) await updateProject(editing.id, data);
      else await createProject(data);
      setEditorOpen(false);
      setEditing(null);
      toast.success('Project saved.');
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  const assigned = (project: Project) => project.members.some(member => member.userId === user?.id);
  const visibleProjects = projects.filter(project => !assignment || assigned(project) === (assignment === 'assigned'));
  const columns: ColumnDef<Project>[] = [
    { accessorKey: 'name', header: 'Project', cell: ({ row }) => <div><p className="wr-entry-title" title={row.original.name}>{row.original.name}</p><p className="wr-entry-excerpt" title={row.original.description || undefined}>{row.original.description || 'No description'}</p></div> },
    { id: 'members', accessorFn: project => project.members.length, header: 'Members', cell: ({ row }) => <div className="flex items-center">{row.original.members.slice(0, 4).map(member => <Avatar key={member.userId} name={member.name} size="xs" className="-ml-1 border border-white first:ml-0" />)}<span className="ml-2 whitespace-nowrap text-[11px]">{row.original.members.length} members</span></div> },
    { id: 'assignment', accessorFn: assigned, header: 'Your assignment', cell: ({ row }) => <Badge tone={assigned(row.original) ? 'success' : 'neutral'}>{assigned(row.original) ? 'Assigned' : 'Not assigned'}</Badge> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <RowActions name={row.original.name} disabled={saving} onView={() => setViewing(row.original)} onEdit={isManager ? () => { setEditing(row.original); setEditorOpen(true); } : undefined} onDelete={isManager ? () => setDeleting(row.original) : undefined}>
      {isManager && <button type="button" title="Manage members" aria-label={`Manage members for ${row.original.name}`} className="wr-action" disabled={saving} onClick={() => setMembersFor(row.original)}><Users className="h-3.5 w-3.5" /></button>}
    </RowActions> },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle={isManager ? 'Manage projects and team assignments.' : 'View the projects available for your weekly work.'}
        crumbs={[{ label: 'Projects' }]}
        actions={isManager && <Button size="sm" onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-3.5 w-3.5" />Add project</Button>}
      />

      <DataTable label="Projects" data={visibleProjects} columns={columns} getRowId={project => project.id} minWidth={700} loading={loading} error={error} onRetry={() => void reload()} searchText={project => `${project.name} ${project.description || ''} ${project.members.map(member => member.name).join(' ')}`} searchPlaceholder="Search projects…" resetKey={assignment} onReset={() => setAssignment('')} filters={<TableFilter label="Your assignment" value={assignment} onChange={setAssignment}><option value="">All assignments</option><option value="assigned">Assigned to me</option><option value="unassigned">Not assigned to me</option></TableFilter>} emptyMessage="No projects found" emptyDescription={isManager ? 'Create a project or adjust your filters.' : 'Ask your manager to assign a project or adjust your filters.'} />
      <Dialog open={!!viewing} onClose={() => setViewing(null)} title="Project details" footer={<Button variant="outline" size="sm" onClick={() => setViewing(null)}>Close</Button>}>
        {viewing && <div className="space-y-4"><h3 className="text-[14px] font-semibold">{viewing.name}</h3><SafeNotes text={viewing.description || 'No description'} /><div><p className="mb-2 text-[11px] font-medium">Assigned members ({viewing.members.length})</p><ul className="space-y-2 text-[12px]">{viewing.members.map(member => <li key={member.userId}>{member.name}</li>)}</ul>{!viewing.members.length && <p className="text-[11px] text-[#817a92]">No members assigned.</p>}</div></div>}
      </Dialog>

      <ProjectDialog open={editorOpen} project={editing} saving={saving} onClose={() => setEditorOpen(false)} onSave={save} />
      <ManageMembersDialog
        open={!!membersFor}
        project={membersFor}
        users={users}
        saving={saving}
        onClose={() => setMembersFor(null)}
        onSave={async ids => {
          if (!membersFor) return;
          setSaving(true);
          try {
            await assignMembers(membersFor.id, ids);
            setMembersFor(null);
            toast.success('Project members updated.');
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setSaving(false);
          }
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => { if (!saving) setDeleting(null); }}
        title="Delete project"
        description={`Delete “${deleting?.name || ''}”? Projects referenced by report history cannot be deleted.`}
        confirmLabel="Delete project"
        loading={saving}
        onConfirm={async () => {
          if (!deleting) return;
          setSaving(true);
          try {
            await deleteProject(deleting.id);
            setDeleting(null);
            toast.success('Project deleted.');
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setSaving(false);
          }
        }}
      />
    </>
  );
}
