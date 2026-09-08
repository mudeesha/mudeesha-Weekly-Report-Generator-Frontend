'use client';

import Link from 'next/link';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { Button } from '@/components/ui/primitives';
import { downloadCsv } from '@/lib/export';
import type { AnalyticsData } from '@/types';

type MemberRow = AnalyticsData['memberRows'][number];
const columns: ColumnDef<MemberRow>[] = [
  { accessorKey: 'name', header: 'Team member', cell: ({ row }) => <Link className="font-medium text-brand-600 hover:underline" href={`/team-members/${row.original.userId}`}>{row.original.name}</Link> },
  { accessorKey: 'reports', header: 'Reports' },
  { accessorKey: 'approved', header: 'Approved' },
  { accessorKey: 'corrections', header: 'Needs correction' },
  { accessorKey: 'hours', header: 'Hours', cell: ({ row }) => `${row.original.hours}h` },
];
export function TeamBreakdownTable({ rows }: { rows: MemberRow[] }) {
  return <DataTable label="Team breakdown" title="Team Breakdown" data={rows} columns={columns} getRowId={row => row.userId} pageSize={5} embedded minWidth={560} searchText={row => row.name} searchPlaceholder="Search members…" actions={<Button size="sm" variant="outline" disabled={!rows.length} onClick={() => downloadCsv('team-breakdown.csv', ['Member', 'Reports', 'Approved', 'Needs correction', 'Hours'], rows.map(row => [row.name, row.reports, row.approved, row.corrections, row.hours]))}><Download className="h-3.5 w-3.5" />Export CSV</Button>} emptyMessage="No data in this period" emptyDescription="Select reporting weeks containing submitted work." />;
}
