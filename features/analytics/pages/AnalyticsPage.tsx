'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, FileText, Target, MessageSquare, ClipboardCheck } from 'lucide-react';
import { useData } from '@/providers/DataProvider';
import { getAnalyticsData } from '@/services/analytics.service';
import { useAsync } from '@/hooks/useAsync';
import { addDays, mondayOf } from '@/lib/format';
import { DashboardFilters } from '@/features/dashboard/components/shared/DashboardFilters';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartCard } from '@/components/common/ChartCard';
import { ChartSkeleton, ErrorState } from '@/components/common/states';
import { Card, Button, SegmentedTabs } from '@/components/ui/primitives';
import { CompletedTasksTrendChart, CompletionTrendChart, StatusByMemberChart, SubmissionTrendChart, TimeByTaskTypeChart, WorkloadByProjectChart } from '@/components/charts/ReportCharts';
import type { ReportFilters } from '@/types';
import { TeamBreakdownTable } from '@/features/analytics/components/TeamBreakdownTable';
export function AnalyticsPage() {
  const { users, projects, revision, error, reload } = useData();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [taskChart, setTaskChart] = useState<'completed' | 'progress'>('completed');
  const [filters, setFilters] = useState<ReportFilters>({ from: addDays(mondayOf(), -21), to: mondayOf() });
  const loader = useCallback((signal: AbortSignal) => getAnalyticsData(filters, users, projects, true, signal), [filters, users, projects, revision]);
  const state = useAsync(loader);
  const data = state.data;
  function changePeriod(value: 'weekly' | 'monthly' | 'quarterly') {
    setPeriod(value);
    setFilters(current => ({ ...current, from: addDays(mondayOf(), value === 'weekly' ? 0 : value === 'monthly' ? -21 : -84), to: mondayOf() }));
  }
  return <>
    <PageHeader
      title="Analytics"
      subtitle="Explore submitted work, project workload and reporting patterns."
      crumbs={[{ label: 'Analytics' }]}
      actions={<Link href="/team-reports">
        <Button variant="outline" size="sm">Review reports</Button>
      </Link>} />
    <div className="mb-4 flex justify-end">
      <SegmentedTabs
        value={period}
        onChange={changePeriod}
        ariaLabel="Analysis period"
        options={[{ value: 'weekly', label: 'This week' }, { value: 'monthly', label: '4 weeks' }, { value: 'quarterly', label: '13 weeks' }]} />
    </div>
    <DashboardFilters value={filters} onChange={setFilters} />
    {state.error || error ? <ErrorState description={state.error || error || ''} onRetry={() => { state.retry(); void reload(); }} /> : state.loading || !data ? <ChartSkeleton /> : <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard compact label="Total reports" value={String(data.totalReports)} helper="Reports within the selected dates" icon={<FileText className="h-4 w-4" />} />
        <MetricCard compact label="Reports submitted" value={String(data.submitted)} helper="Includes reviewed submissions" icon={<ClipboardCheck className="h-4 w-4" />} />
        <MetricCard
          compact
          label="Approval rate"
          value={`${data.approvalRate}%`}
          helper="Approved ÷ submitted reports"
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="success" />
        <MetricCard
          compact
          label="Needs correction"
          value={String(data.needsCorrection)}
          helper="Awaiting a revised submission"
          icon={<MessageSquare className="h-4 w-4" />}
          tone="warning" />
        <MetricCard
          compact
          label="Completed tasks"
          value={String(data.completedTasks)}
          helper="Current-week tasks in visible submissions"
          icon={<Target className="h-4 w-4" />} />
        <MetricCard compact label="Reported time" value={`${data.totalHours}h`} helper="No private drafts or duplicate versions" icon={<Clock3 className="h-4 w-4" />} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard title="Report Submission Trend" subtitle="Each report counted once per reporting week." className="xl:col-span-2">
          <SubmissionTrendChart data={data.submissionTrend} mode="area" />
        </ChartCard>
        <ChartCard title="Time by Task Type" subtitle="Submitted task entries only.">
          <TimeByTaskTypeChart data={data.timeByTaskType} height={250} />
        </ChartCard>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard
          title={taskChart === 'completed' ? 'Tasks Completed Over Time' : 'Planned vs Actual Progress'}
          subtitle="Based on the latest report content visible to the manager."
          actions={<SegmentedTabs
            value={taskChart}
            onChange={setTaskChart}
            ariaLabel="Task chart"
            options={[{ value: 'completed', label: 'Completed' }, { value: 'progress', label: 'Progress %' }]} />}>
          {taskChart === 'completed' ? <CompletedTasksTrendChart data={data.completedTrend} /> : <CompletionTrendChart data={data.completionTrend} />}
        </ChartCard>
        <ChartCard title="Report Status by Member" subtitle="Current status of reports in the selected period.">
          <StatusByMemberChart data={data.statusByMember} />
        </ChartCard>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <ChartCard title="Workload by Project" subtitle="Task counts and spent hours.">
          <WorkloadByProjectChart data={data.workloadByProject} />
        </ChartCard>
        <Card className="min-w-0 overflow-hidden xl:col-span-2">
          <TeamBreakdownTable rows={data.memberRows} />
        </Card>
      </div>
    </>}
  </>;
}
