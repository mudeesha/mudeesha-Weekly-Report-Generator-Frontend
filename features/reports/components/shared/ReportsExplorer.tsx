'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from '@/lib/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { getReports } from '@/services/report.service';
import { useAsync } from '@/hooks/useAsync';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { ReportTable } from './ReportTable';
import { reportStatusLabel } from '@/lib/format';
import type { ReportStatus } from '@/types';

export function ReportsExplorer({ userId, showMember = false }: { userId?: string; showMember?: boolean }) {
  const { user, isManager } = useAuth();
  const { users, projects, revision } = useData();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [member, setMember] = useState(userId || '');
  const [project, setProject] = useState('');
  const [status, setStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  useEffect(() => { setSearch(params.get('q') || ''); }, [params]);
  useEffect(() => { setMember(userId || ''); setPagination(current => ({ ...current, pageIndex: 0 })); }, [userId]);
  const loader = useCallback((signal: AbortSignal) => getReports({ userId: userId || member || undefined, projectId: project || undefined, status, from: from || undefined, to: to || undefined }, pagination.pageIndex + 1, pagination.pageSize, signal), [userId, member, project, status, from, to, pagination, revision, user?.id]);
  const result = useAsync(loader);
  function firstPage() { setPagination(current => ({ ...current, pageIndex: 0 })); }
  function reset() { setMember(userId || ''); setProject(''); setStatus('ALL'); setFrom(''); setTo(''); setSearch(''); firstPage(); }
  useEffect(() => {
    if (result.loading || !result.data) return;
    const last = Math.max(0, Math.ceil(result.data.total / pagination.pageSize) - 1);
    if (pagination.pageIndex > last) setPagination(current => ({ ...current, pageIndex: last }));
  }, [result.loading, result.data, pagination.pageIndex, pagination.pageSize]);

  return <ReportTable reports={result.data?.items || []} showMember={showMember} embedded={false} loading={result.loading} error={result.error} onRetry={result.retry} searchValue={search} onSearchChange={setSearch} onReset={reset} serverPagination={{ ...pagination, total: result.data?.total || 0, onChange: setPagination }} filters={<>
    {isManager && !userId && <TableFilter label="Team member" value={member} onChange={value => { setMember(value); firstPage(); }}><option value="">All members</option>{users.map(item => <option key={item.id} value={item.id}>{item.name}{!item.isActive ? ' (inactive)' : ''}</option>)}</TableFilter>}
    <TableFilter label="Project" value={project} onChange={value => { setProject(value); firstPage(); }}><option value="">All projects</option>{projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</TableFilter>
    <TableFilter label="Status" value={status} onChange={value => { setStatus(value as ReportStatus | 'ALL'); firstPage(); }}><option value="ALL">All statuses</option>{Object.entries(reportStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</TableFilter>
    <TableFilter label="From" type="date" value={from} onChange={value => { setFrom(value); firstPage(); }} />
    <TableFilter label="To" type="date" value={to} onChange={value => { setTo(value); firstPage(); }} />
  </>} />;
}
