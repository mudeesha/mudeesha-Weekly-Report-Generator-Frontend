'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { Avatar } from '@/components/ui/primitives';
import { DataTable } from '@/components/ui/data-table/DataTable';
import type { DataTableProps } from '@/components/ui/data-table/DataTable';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { ReportStatusBadge } from '@/components/common/StatusBadge';
import { formatDate, formatDateTime, isEditableStatus, reportStatusLabel } from '@/lib/format';
import type { ReportListItem } from '@/types';

type Props = Omit<DataTableProps<ReportListItem>, 'data' | 'columns' | 'label' | 'searchText'> & { reports: ReportListItem[]; showMember?: boolean };

export function ReportTable({ reports, showMember = false, embedded = true, ...props }: Props) {
  const { user, isManager } = useAuth();
  const { getUserById } = useData();
  const columns: ColumnDef<ReportListItem>[] = [
    ...(showMember ? [{ id: 'member', accessorFn: (report: ReportListItem) => getUserById(report.userId)?.name || `Member #${report.userId}`, header: 'Team member', cell: ({ row }: { row: { original: ReportListItem } }) => {
      const report = row.original;
      const name = getUserById(report.userId)?.name || `Member #${report.userId}`;
      return <div className="flex items-center gap-2"><Avatar name={name} size="xs" /><Link href={`/team-members/${report.userId}`} className="font-medium hover:text-brand-600">{name}</Link></div>;
    } }] : []),
    { accessorKey: 'periodStart', header: 'Reporting week', cell: ({ row: { original: report } }) => <div><p className="font-medium text-[#3e3759]">Week {report.weekNumber} · {report.year}</p><p className="mt-0.5 whitespace-nowrap text-[11px] text-[#817a92]">{formatDate(report.periodStart)} – {formatDate(report.periodEnd)}</p></div> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <ReportStatusBadge status={row.original.status} /> },
    { accessorKey: 'dueAt', header: 'Deadline', cell: ({ row }) => <span className="whitespace-nowrap text-[11px]">{formatDateTime(row.original.dueAt)}</span> },
    { accessorKey: 'updatedAt', header: 'Last updated', cell: ({ row }) => <span className="whitespace-nowrap text-[11px]">{formatDateTime(row.original.updatedAt)}</span> },
    { id: 'actions', header: 'Actions', enableSorting: false, cell: ({ row: { original: report } }) => {
      const editable = user?.id === report.userId && user.role === 'TEAM_MEMBER' && isEditableStatus(report.status);
      return isManager && report.status === 'DRAFT' ? <span className="inline-flex h-8 w-8 items-center justify-center text-[#938ca2]" title="Draft content is private to the owner" aria-label="Private draft"><LockKeyhole className="h-3.5 w-3.5" /></span> : <RowActions name={`report ${report.id}`} viewHref={`/reports/${report.id}`} editHref={editable ? `/reports/${report.id}/edit` : undefined} />;
    } },
  ];
  return <DataTable {...props} data={reports} columns={columns} label={showMember ? 'Team reports' : 'Reports'} embedded={embedded} minWidth={showMember ? 900 : 740} getRowId={report => report.id} searchText={report => `${report.id} ${report.periodStart} ${report.periodEnd} ${report.weekNumber} ${report.year} ${getUserById(report.userId)?.name || ''} ${reportStatusLabel[report.status]}`} searchPlaceholder={props.serverPagination ? 'Search this page…' : 'Search reports…'} emptyMessage="No reports found" emptyDescription="No reports match this selection. Try another week or clear the filters." />;
}
