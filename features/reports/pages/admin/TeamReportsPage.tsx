'use client';

import { CheckCircle2, ClipboardList, Clock3, MessageSquare } from 'lucide-react';
import { useData } from '@/providers/DataProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ReportsExplorer } from '@/features/reports/components/shared/ReportsExplorer';
import { ErrorState, TableSkeleton } from '@/components/common/states';
export function TeamReportsPage() {
  const { reports, loading, error, reload } = useData();
  return <>
    <PageHeader
      title="Team Reports"
      subtitle="Review team submissions and track reporting status. Draft content stays private."
      crumbs={[{ label: 'Team Reports' }]} />
    {error ? <ErrorState description={error} onRetry={() => void reload()} /> : loading ? <TableSkeleton rows={2} /> : <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <MetricCard label="Total reports" value={String(reports.length)} helper="All recorded reporting weeks" icon={<ClipboardList className="h-5 w-5" />} />
        <MetricCard
          label="Awaiting review"
          value={String(reports.filter(r => r.status === 'SUBMITTED').length)}
          helper="Ready for a manager review"
          icon={<Clock3 className="h-5 w-5" />} />
        <MetricCard
          label="Needs correction"
          value={String(reports.filter(r => r.status === 'NEEDS_CORRECTION').length)}
          helper="Awaiting a revised submission"
          icon={<MessageSquare className="h-5 w-5" />}
          tone="warning" />
        <MetricCard
          label="Approved reports"
          value={String(reports.filter(r => r.status === 'APPROVED').length)}
          helper="Review completed"
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="success" />
      </div>
      <ReportsExplorer showMember />
    </>}
  </>;
}
