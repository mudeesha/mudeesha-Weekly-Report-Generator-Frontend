'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, MessageSquare, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { getAnalyticsData } from '@/services/analytics.service';
import { useAsync } from '@/hooks/useAsync';
import { addDays, formatDateTime, mondayOf } from '@/lib/format';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartCard } from '@/components/common/ChartCard';
import { ErrorState, ChartSkeleton, EmptyState } from '@/components/common/states';
import { Button, Card } from '@/components/ui/primitives';
import { ReportStatusBadge } from '@/components/common/StatusBadge';
import { ReportTable } from '@/features/reports/components/shared/ReportTable';
import { SubmissionTrendChart, TimeByTaskTypeChart } from '@/components/charts/ReportCharts';

export function MemberDashboard() {
  const { user } = useAuth();
  const { reports, users, projects, revision, error, reload } = useData();
  const week = mondayOf();
  const loader = useCallback((signal: AbortSignal) => getAnalyticsData({ userId: user?.id }, users, projects, false, signal), [user?.id, users, projects, revision]);
  const state = useAsync(loader);
  const data = state.data;
  const current = reports.find(report => report.userId === user?.id && report.periodStart === week);
  const recent = [...reports].filter(report => report.userId === user?.id).sort((a, b) => b.periodStart.localeCompare(a.periodStart)).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0] || 'there'}!`}
        subtitle="Here is your weekly reporting overview."
        actions={<Link href={current ? `/reports/${current.id}` : '/reports/new'}><Button size="sm"><Plus className="h-3.5 w-3.5" />{current ? 'Open report' : 'Create report'}</Button></Link>}
      />

      {state.error || error ? <ErrorState description={state.error || error || ''} onRetry={() => { state.retry(); void reload(); }} /> : state.loading || !data ? <ChartSkeleton /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Reports" value={String(data.totalReports)} helper="Reports in your workspace" icon={<FileText className="h-4 w-4" />} />
            <MetricCard label="Approved" value={String(data.approved)} helper={`${data.approvalRate}% approval rate`} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
            <MetricCard label="Needs correction" value={String(data.needsCorrection)} helper="Reports requiring an update" icon={<MessageSquare className="h-4 w-4" />} tone="warning" />
            <MetricCard label="Reported hours" value={`${data.totalHours}h`} helper="Current-week task hours" icon={<Clock3 className="h-4 w-4" />} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,.9fr)]">
            <ChartCard title="Reporting Activity" subtitle="Submitted and approved reports across your reporting weeks.">
              {data.submissionTrend.length ? <SubmissionTrendChart data={data.submissionTrend} height={260} /> : <EmptyState title="No reporting activity yet" description="Create your first weekly report to populate this chart." />}
            </ChartCard>
            <ChartCard title="Time Distribution" subtitle="Reported hours by task type."><TimeByTaskTypeChart data={data.timeByTaskType} height={260} /></ChartCard>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#393353]">Recent Reports</h3>
                  <p className="mt-0.5 text-[10px] text-[#938ca2]">Your latest report records.</p>
                </div>
                <Link href="/reports" className="text-[10px] font-medium text-[#594dba] hover:underline">View all</Link>
              </div>
              <ReportTable reports={recent} />
            </Card>

            <div className="space-y-4">
              <Card className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#594dba]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-[#938ca2]">Upcoming deadline</p>
                    <h3 className="mt-1.5 text-[14px] font-semibold text-[#393353]">{current ? `Week ${current.weekNumber}` : 'This week’s report'}</h3>
                    <p className="mt-1 text-[11px] text-[#6e6687]">Due {formatDateTime(current?.dueAt || `${addDays(week, 7)}T09:00:00`)}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {current ? <ReportStatusBadge status={current.status} /> : <span className="text-[10px] text-[#938ca2]">Not started</span>}
                      <Link href={current ? `/reports/${current.id}` : '/reports/new'} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#594dba]">Open<ArrowRight className="h-3 w-3" /></Link>
                    </div>
                  </div>
                </div>
              </Card>

              {data.details.filter(report => report.status === 'NEEDS_CORRECTION').slice(0, 1).map(report => (
                <Card key={report.id} className="border-[#f5d9cb] p-4 sm:p-5">
                  <p className="text-[10px] font-medium text-[#c85d42]">Action required</p>
                  <h3 className="mt-1.5 text-[12px] font-semibold text-[#554c74]">Changes requested · Week {report.weekNumber}</h3>
                  <p className="mt-1.5 line-clamp-3 text-[10px] leading-4 text-[#817a92]">{report.latestReview?.comment || 'Open the report to view reviewer feedback.'}</p>
                  <Link href={`/reports/${report.id}/edit`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-medium text-[#594dba]">Correct report<ArrowRight className="h-3 w-3" /></Link>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
