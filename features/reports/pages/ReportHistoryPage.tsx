'use client';

import { useCallback } from 'react';
import { CheckCircle2, FileText, History, MessageSquare } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { getAnalyticsData } from '@/services/analytics.service';
import { useAsync } from '@/hooks/useAsync';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ReportsExplorer } from '@/features/reports/components/shared/ReportsExplorer';
import { Card } from '@/components/ui/primitives';
import { ErrorState, TableSkeleton } from '@/components/common/states';
export function ReportHistoryPage() {
  const { user, isManager } = useAuth();
  const { users, projects, revision, error, reload } = useData();
  const loader = useCallback((signal: AbortSignal) => getAnalyticsData(isManager ? {} : { userId: user?.id }, users, projects, isManager, signal), [isManager, user?.id, users, projects, revision]);
  const state = useAsync(loader);
  const data = state.data;
  return <>
    <PageHeader
      title="Report History"
      subtitle={isManager ? 'Browse team submissions and their preserved review history.' : 'Browse your weekly reports and preserved submissions.'}
      crumbs={[{ label: 'Report History' }]} />
    {state.error || error ? <ErrorState description={state.error || error || ''} onRetry={() => { state.retry(); void reload(); }} /> : state.loading || !data ? <TableSkeleton rows={2} /> : <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MetricCard label="Reports submitted" value={String(data.submitted)} helper="Distinct reports across all weeks" icon={<FileText className="h-5 w-5" />} />
        <MetricCard label="Approved reports" value={String(data.approved)} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <MetricCard
          label="Correction cycles"
          value={String(data.correctionCycles)}
          helper="Recorded change requests on visible versions"
          icon={<MessageSquare className="h-5 w-5" />}
          tone="warning" />
        <MetricCard
          label="Visible versions"
          value={String(data.versionCount)}
          helper={isManager ? 'Submitted versions only' : 'Includes your editable versions'}
          icon={<History className="h-5 w-5" />} />
      </div>
      <ReportsExplorer userId={isManager ? undefined : user?.id} showMember={isManager} />
      <Card className="mt-6 p-5">
        <h3 className="font-semibold text-gray-800">Your report history stays intact</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500">Corrections belong to the same weekly report. Open a report to view each preserved version, its submission time, and the manager feedback attached to that exact version. Unsubmitted content is available only to its owner.</p>
      </Card>
    </>}
  </>;
}
