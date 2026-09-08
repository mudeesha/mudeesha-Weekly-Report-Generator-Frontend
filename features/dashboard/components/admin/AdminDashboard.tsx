'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ClipboardList, ShieldAlert, Target } from 'lucide-react';
import { useData } from '@/providers/DataProvider';
import { getAnalyticsData } from '@/services/analytics.service';
import { useAsync } from '@/hooks/useAsync';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartCard } from '@/components/common/ChartCard';
import { ChartSkeleton, ErrorState, EmptyState } from '@/components/common/states';
import { Button, Card } from '@/components/ui/primitives';
import { ComplianceGauge, SubmissionTrendChart, StatusByMemberChart, TimeByTaskTypeChart, WorkloadByProjectChart } from '@/components/charts/ReportCharts';
import { DashboardFilters } from '@/features/dashboard/components/shared/DashboardFilters';
import { ActivityFeed } from '@/features/dashboard/components/shared/ActivityFeed';
import { ReportTable } from '@/features/reports/components/shared/ReportTable';
import type { ReportFilters } from '@/types';

export function AdminDashboard() {
  const { users, projects, revision, loading, error, reload } = useData();
  const [filters, setFilters] = useState<ReportFilters>({});
  const loader = useCallback((signal: AbortSignal) => getAnalyticsData(filters, users, projects, true, signal), [filters, users, projects, revision]);
  const state = useAsync(loader);
  const data = state.data;

  return (
    <>
      <PageHeader
        title="Team Overview"
        subtitle="Reporting performance, workload and team activity."
        crumbs={[{ label: 'Dashboard' }]}
        actions={<Link href="/team-reports"><Button size="sm">Review reports</Button></Link>}
      />
      <DashboardFilters value={filters} onChange={setFilters} />

      {error || state.error ? <ErrorState description={error || state.error || ''} onRetry={() => { void reload(); state.retry(); }} /> : loading || state.loading || !data ? <ChartSkeleton /> : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Reports submitted" value={String(data.submitted)} helper="Distinct submitted reports" icon={<ClipboardList className="h-4 w-4" />} />
            <MetricCard label="Active-member coverage" value={data.coverage === null ? '—' : `${data.coverage}%`} helper={`${data.reportingMembers} of ${data.activeMembers} active members`} icon={<Target className="h-4 w-4" />} tone="success" />
            <MetricCard label="Needs correction" value={String(data.needsCorrection)} helper="Awaiting resubmission" icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
            <MetricCard label="Open blockers" value={String(data.openBlockers)} helper="Open issues in submitted reports" icon={<ShieldAlert className="h-4 w-4" />} tone="error" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <ChartCard title="Report Submissions" subtitle="Submitted and approved reports for the selected period." className="xl:col-span-2">
              {data.submissionTrend.length ? <SubmissionTrendChart data={data.submissionTrend} height={270} /> : <EmptyState title="No team data" description="Create users and reports to populate this chart." />}
            </ChartCard>
            <ChartCard title="Submission Coverage" subtitle="Current active team roster.">
              <ComplianceGauge value={data.coverage || 0} caption={data.coverage === null ? 'No active reporting members in this selection.' : `${data.reportingMembers} of ${data.activeMembers} active members submitted.`} />
              <dl className="mt-3 grid grid-cols-3 divide-x divide-[#e7e5eb] border-y border-[#ece9f0] py-3 text-center">
                <div><dt className="text-[9px] text-[#938ca2]">On time</dt><dd className="mt-1 text-[12px] font-semibold text-[#4e4769]">{data.onTime}</dd></div>
                <div><dt className="text-[9px] text-[#938ca2]">Late</dt><dd className="mt-1 text-[12px] font-semibold text-[#4e4769]">{data.late}</dd></div>
                <div><dt className="text-[9px] text-[#938ca2]">Pending</dt><dd className="mt-1 text-[12px] font-semibold text-[#4e4769]">{data.pending}</dd></div>
              </dl>
            </ChartCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <ChartCard
              title="Submission Status by Member"
              subtitle="Submitted, draft and not-submitted reports. Hover a submitted report to see its review outcome."
            >
              <StatusByMemberChart data={data.statusByMember} />
            </ChartCard>
            <ChartCard title="Workload by Project" subtitle="Current-week tasks and spent hours.">{data.workloadByProject.length ? <WorkloadByProjectChart data={data.workloadByProject} /> : <EmptyState title="No submitted work" description="Task data appears after reports are submitted." />}</ChartCard>
            <ChartCard title="Time by Task Type" subtitle="Calculated from task-level spent hours."><TimeByTaskTypeChart data={data.timeByTaskType} /></ChartCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Card className="overflow-hidden xl:col-span-2">
              <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                <h3 className="text-[14px] font-semibold text-[#393353]">Recent Reports</h3>
                <Link href="/team-reports" className="text-[10px] font-medium text-[#594dba] hover:underline">View all</Link>
              </div>
              <ReportTable reports={data.recentReports} showMember />
            </Card>
            <ChartCard title="Recent Activity" subtitle="Submissions and reviews for the selected period."><ActivityFeed activities={data.activities} /></ChartCard>
          </div>
        </>
      )}
    </>
  );
}
