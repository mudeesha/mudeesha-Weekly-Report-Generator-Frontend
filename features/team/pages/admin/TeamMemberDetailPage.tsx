'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useParams } from '@/lib/navigation';
import { CheckCircle2, Clock3, FileText, Mail, MessageSquare } from 'lucide-react';
import { getUser } from '@/services/user.service';
import { getAnalyticsData } from '@/services/analytics.service';
import { useAsync } from '@/hooks/useAsync';
import { useData } from '@/providers/DataProvider';
import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/MetricCard';
import { ChartCard } from '@/components/common/ChartCard';
import { Avatar, Badge, Card } from '@/components/ui/primitives';
import { ReportsExplorer } from '@/features/reports/components/shared/ReportsExplorer';
import { ErrorState, TableSkeleton } from '@/components/common/states';
import { SubmissionTrendChart, TimeByTaskTypeChart } from '@/components/charts/ReportCharts';
import { ActivityFeed } from '@/features/dashboard/components/shared/ActivityFeed';
import { roleLabel } from '@/lib/format';

export function TeamMemberDetailPage() {
  const { id = '' } = useParams();
  const { users, projects, revision, error, reload } = useData();
  const loader = useCallback(async (signal: AbortSignal) => {
    const member = await getUser(id, signal);
    const data = await getAnalyticsData({ userId: id }, users, projects, true, signal);
    return { member, data };
  }, [id, users, projects, revision]);
  const state = useAsync(loader);

  if (state.loading) return <TableSkeleton />;
  if (state.error || error || !state.data) return <ErrorState description={state.error || error || 'User not found.'} onRetry={() => { state.retry(); void reload(); }} />;

  const { member, data } = state.data;
  const assignments = projects.filter(project => project.members.some(memberLink => memberLink.userId === id));

  return <>
    <PageHeader title="Team Member" subtitle="Profile, project assignments and reporting history." crumbs={[{ label: 'Team Members', to: '/team-members' }, { label: member.name }]} />

    <Card className="mb-4 overflow-hidden">
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#3c3374]">{member.name}</h2>
              <Badge tone="brand">{roleLabel[member.role]}</Badge>
              <Badge tone={member.isActive ? 'success' : 'neutral'}>{member.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#887f9d]"><Mail className="h-3.5 w-3.5" />{member.email}</div>
          </div>
        </div>
        <Link href="/projects" className="text-[11px] font-medium text-[#594dba] hover:underline">View project assignments</Link>
      </div>
      <div className="border-t border-[#ece9f0] px-4 py-3">
        <p className="mb-2 text-[10px] font-medium text-[#887f9d]">Assigned projects</p>
        {assignments.length ? <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {assignments.map(project => <span key={project.id} className="text-[12px] text-[#544c74]">{project.name}</span>)}
        </div> : <p className="text-[11px] text-[#938ca2]">No projects assigned.</p>}
      </div>
    </Card>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Reports" value={String(data.totalReports)} icon={<FileText className="h-4 w-4" />} />
      <MetricCard label="Approved" value={String(data.approved)} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
      <MetricCard label="Needs correction" value={String(data.needsCorrection)} icon={<MessageSquare className="h-4 w-4" />} tone="warning" />
      <MetricCard label="Reported hours" value={`${data.totalHours}h`} icon={<Clock3 className="h-4 w-4" />} helper="Submitted work only" />
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      <ChartCard title="Reporting history" subtitle="Submissions and approvals by reporting week." className="xl:col-span-2">
        <SubmissionTrendChart data={data.submissionTrend} height={220} />
      </ChartCard>
      <ChartCard title="Time by task type" subtitle="Visible submitted work only.">
        <TimeByTaskTypeChart data={data.timeByTaskType} height={220} />
      </ChartCard>
    </div>

    <div className="mt-4 grid gap-4 xl:grid-cols-3">
      <div className="min-w-0 xl:col-span-2"><ReportsExplorer userId={id} /></div>
      <ChartCard title="Recent activity"><ActivityFeed activities={data.activities} /></ChartCard>
    </div>
  </>;
}
