'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useData } from '@/providers/DataProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar, Badge } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { ReportStatusBadge } from '@/components/common/StatusBadge';
import { formatDate, mondayOf, weekOptions } from '@/lib/format';
import type { User } from '@/types';

export function TeamMembersPage() {
  const { users, projects, reports, loading, error, reload } = useData();
  const [project, setProject] = useState('');
  const [week, setWeek] = useState(mondayOf());
  const members = users.filter(user => user.role === 'TEAM_MEMBER' && (!project || user.projectIds.includes(project)));
  const projectNames = (member: User) => projects.filter(item => member.projectIds.includes(item.id)).map(item => item.name).join(', ');
  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Team member', cell: ({ row }) => <div className="flex items-center gap-2.5"><Avatar name={row.original.name} size="sm" /><div><p className="font-medium">{row.original.name}</p><p className="mt-0.5 text-[11px] text-[#817a92]">{row.original.email}</p></div></div> },
    { id: 'projects', accessorFn: projectNames, header: 'Projects', cell: ({ row }) => <p className="max-w-[280px] truncate text-[11px]" title={projectNames(row.original)}>{projectNames(row.original) || 'Not assigned'}</p> },
    { accessorKey: 'isActive', header: 'Account', cell: ({ row }) => <Badge tone={row.original.isActive ? 'success' : 'neutral'}>{row.original.isActive ? 'Active' : 'Inactive'}</Badge> },
    { id: 'report', header: 'Week status', accessorFn: member => reports.find(report => report.userId === member.id && report.periodStart === week)?.status || 'NOT_STARTED', cell: ({ row }) => {
      const report = reports.find(item => item.userId === row.original.id && item.periodStart === week);
      return <div>{report ? <ReportStatusBadge status={report.status} /> : <Badge>{row.original.isActive ? 'Not started' : 'No report'}</Badge>}<p className="mt-1 text-[10px] text-[#817a92]">{formatDate(week)}</p></div>;
    } },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <RowActions name={row.original.name} viewHref={`/team-members/${row.original.id}`} /> },
  ];
  return <>
    <PageHeader title="Team Members" subtitle="Member profiles, project assignments and weekly reporting status." crumbs={[{ label: 'Team Members' }]} />
    <DataTable label="Team members" data={members} columns={columns} getRowId={user => user.id} loading={loading} error={error} onRetry={() => void reload()} minWidth={740} searchText={user => `${user.name} ${user.email} ${projectNames(user)}`} searchPlaceholder="Search members…" resetKey={`${project}:${week}`} onReset={() => { setProject(''); setWeek(mondayOf()); }} filters={<>
      <TableFilter label="Project" value={project} onChange={setProject}><option value="">All projects</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</TableFilter>
      <TableFilter label="Reporting week" value={week} onChange={setWeek}>{weekOptions(55).map(item => <option key={item.start} value={item.start}>{item.label}</option>)}</TableFilter>
    </>} emptyMessage="No team members" emptyDescription="Create team members in Users, or change your filters." />
    <p className="mt-3 text-[10px] text-[#817a92]">“Not started” uses the current active member list. Historical employment eligibility is not available from the API.</p>
  </>;
}
