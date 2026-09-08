'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useParams } from '@/lib/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { getReport, getVersions } from '@/services/report.service';
import { useAsync } from '@/hooks/useAsync';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorState, TableSkeleton } from '@/components/common/states';
import { MemberReportDetails } from '@/features/reports/components/member/MemberReportDetails';
import { AdminReportDetails } from '@/features/reports/components/admin/AdminReportDetails';
import type { WeeklyReport } from '@/types';

export function ReportDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { user, isManager } = useAuth();
  const { projects, users, reload } = useData();
  const loader = useCallback(async (signal: AbortSignal) => {
    const report = await getReport(id, signal);
    const versions = await getVersions(id, signal);
    return { report, versions };
  }, [id, user?.id]);
  const state = useAsync(loader);

  async function changed(report: WeeklyReport) {
    state.setData(value => value ? { ...value, report } : null);
    state.retry();
    await reload();
  }

  if (state.loading) return <TableSkeleton />;
  if (state.error || !state.data) {
    return (
      <>
        <PageHeader title="Report detail" />
        <ErrorState description={state.error || 'Report not found.'} onRetry={state.retry} />
        <Link className="mt-3 inline-block text-[11px] text-[#594dba]" href={isManager ? '/team-reports' : '/reports'}>Back to reports</Link>
      </>
    );
  }

  const { report, versions } = state.data;
  const owner = users.find(item => item.id === report.userId)?.name || (user?.id === report.userId ? user.name : `Team member #${report.userId}`);

  if (isManager) return <AdminReportDetails report={report} versions={versions} projects={projects} users={users} owner={owner} onUpdated={changed} />;
  return <MemberReportDetails report={report} versions={versions} projects={projects} users={users} owner={owner} onUpdated={changed} />;
}
