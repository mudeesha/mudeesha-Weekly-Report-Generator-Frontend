import { TASK_TYPE_LABELS, TASK_TYPES } from '@/types';
import type { Activity, AnalyticsData, Project, ReportFilters, ReportListItem, ReportVersion, User, WeeklyReport } from '@/types';
import { formatDate, parseTimestamp, roundHours } from '@/lib/format';
/** Aggregate only content the current viewer was allowed to retrieve. Never count old versions twice. */
export function aggregateAnalytics(summaries: ReportListItem[], details: WeeklyReport[], projects: Project[], users: User[], activities: Activity[], filters: ReportFilters = {}, histories: Record<string, ReportVersion[]> = {}, now = Date.now()): AnalyticsData {
  const visible = details.filter(report => !filters.projectId || report.currentVersion.tasks.some(t => t.projectId === filters.projectId));
  const visibleIds = new Set(visible.map(report => report.id));
  const reports = filters.projectId ? summaries.filter(report => visibleIds.has(report.id)) : summaries;
  const tasks = visible.flatMap(report => report.currentVersion.tasks.filter(task => task.section === 'THIS_WEEK' && (!filters.projectId || task.projectId === filters.projectId)));
  const approved = reports.filter(report => report.status === 'APPROVED').length;
  const submitted = reports.filter(report => report.status !== 'DRAFT').length;
  const active = users.filter(user => user.role === 'TEAM_MEMBER' && user.isActive && (!filters.userId || user.id === filters.userId) && (!filters.projectId || user.projectIds.includes(filters.projectId)));
  const reporting = active.filter(user => reports.some(report => report.userId === user.id && report.status !== 'DRAFT'));
  const notStarted = active.filter(user => !reports.some(report => report.userId === user.id)).length;
  let onTime = 0, late = 0;
  for (const report of visible) {
    const dates = (histories[report.id] || [report.currentVersion]).map(v => v.submittedAt).filter((v): v is string => !!v).map(v => parseTimestamp(v).getTime());
    if (dates.length) {
      if (Math.min(...dates) <= parseTimestamp(report.dueAt).getTime())
        onTime++;
      else
        late++;
    }
  }
  const pending = active.filter(user => !reports.some(report => report.userId === user.id && report.status !== 'DRAFT')).length;
  const weeks = [...new Set(reports.map(report => report.periodStart))].sort();
  const submittedTrend = weeks.map(week => ({ label: formatDate(week), submitted: reports.filter(r => r.periodStart === week && r.status !== 'DRAFT').length, approved: reports.filter(r => r.periodStart === week && r.status === 'APPROVED').length, expected: 0 }));
  const completionTrend = weeks.map(week => {
    const entries = visible.filter(r => r.periodStart === week).flatMap(r => r.currentVersion.tasks).filter(t => t.section === 'THIS_WEEK' && (!filters.projectId || t.projectId === filters.projectId));
    const planned = entries.filter(t => t.plannedPercent !== null);
    const actual = entries.filter(t => t.actualPercent !== null);
    return { label: formatDate(week), planned: planned.length ? roundHours(planned.reduce((sum, t) => sum + (t.plannedPercent || 0), 0) / planned.length) : 0, actual: actual.length ? roundHours(actual.reduce((sum, t) => sum + (t.actualPercent || 0), 0) / actual.length) : 0 };
  });
  const memberIds = [...new Set([...active.map(u => u.id), ...reports.map(r => r.userId)])];
  
  const statusByMember = memberIds.map(id => {
  const memberReports = reports.filter(report => report.userId === id);

  const approved = memberReports.filter(
    report => report.status === 'APPROVED'
  ).length;

  const needsCorrection = memberReports.filter(
    report => report.status === 'NEEDS_CORRECTION'
  ).length;

  const awaitingReview = memberReports.filter(
    report => report.status === 'SUBMITTED'
  ).length;

  const draft = memberReports.filter(
    report => report.status === 'DRAFT'
  ).length;

  const submitted = approved + needsCorrection + awaitingReview;

  const notSubmitted =
    active.some(user => user.id === id) && memberReports.length === 0
      ? 1
      : 0;

  return {
    member:
      users.find(user => user.id === id)?.name ||
      `Member #${id}`,

    submitted,
    draft,
    notSubmitted,

    approved,
    needsCorrection,
    awaitingReview,
  };
});

  const workloadByProject = [...new Set(tasks.map(t => t.projectId))].map(id => ({ project: projects.find(p => p.id === id)?.name || `Project #${id}`, tasks: tasks.filter(t => t.projectId === id).length, hours: roundHours(tasks.filter(t => t.projectId === id).reduce((sum, t) => sum + (t.spentHours || 0), 0)) }));
  const timeByTaskType = TASK_TYPES.map(type => ({ type, hours: roundHours(tasks.filter(t => TASK_TYPE_LABELS[t.taskType] === type).reduce((sum, t) => sum + (t.spentHours || 0), 0)) }));
  return {
    totalReports: reports.length, submitted, approved, needsCorrection: reports.filter(r => r.status === 'NEEDS_CORRECTION').length,
    openBlockers: visible.reduce((sum, r) => sum + r.currentVersion.blockers.filter(b => b.status === 'OPEN').length, 0),
    totalHours: roundHours(tasks.reduce((sum, t) => sum + (t.spentHours || 0), 0)), approvalRate: submitted ? Math.round(approved / submitted * 100) : 0,
    avgTaskCompletion: tasks.filter(t => t.actualPercent !== null).length ? roundHours(tasks.reduce((sum, t) => sum + (t.actualPercent || 0), 0) / tasks.filter(t => t.actualPercent !== null).length) : 0,
    versionCount: visible.reduce((sum, r) => sum + (histories[r.id]?.length || 1), 0),
    correctionCycles: visible.reduce((sum, r) => sum + (histories[r.id] || []).reduce((cycles, v) => cycles + v.reviews.filter(review => review.action === 'REQUEST_CHANGES').length, 0), 0),
    completedTrend: weeks.map(week => ({ label: formatDate(week), completed: visible.filter(r => r.periodStart === week).flatMap(r => r.currentVersion.tasks).filter(t => t.section === 'THIS_WEEK' && t.status === 'COMPLETED' && (!filters.projectId || t.projectId === filters.projectId)).length })),
    submissionTrend: submittedTrend, completionTrend, statusByMember, workloadByProject, timeByTaskType,
    memberRows: memberIds.map(id => ({ userId: id, name: users.find(u => u.id === id)?.name || `Member #${id}`, reports: reports.filter(r => r.userId === id).length, approved: reports.filter(r => r.userId === id && r.status === 'APPROVED').length, corrections: reports.filter(r => r.userId === id && r.status === 'NEEDS_CORRECTION').length, hours: roundHours(visible.filter(r => r.userId === id).flatMap(r => r.currentVersion.tasks).filter(t => t.section === 'THIS_WEEK' && (!filters.projectId || t.projectId === filters.projectId)).reduce((sum, t) => sum + (t.spentHours || 0), 0)) })),
    drafts: reports.filter(r => r.status === 'DRAFT').length, pendingReview: reports.filter(r => r.status === 'SUBMITTED').length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETED').length, activeMembers: active.length, reportingMembers: reporting.length,
    coverage: active.length ? Math.round(reporting.length / active.length * 100) : null, onTime, late, pending, notStarted,
    overdue: reports.filter(r => r.status === 'DRAFT' && parseTimestamp(r.dueAt).getTime() < now).length,
    recentReports: [...reports].sort((a, b) => parseTimestamp(b.updatedAt).getTime() - parseTimestamp(a.updatedAt).getTime()).slice(0, 6), details: visible, activities,
  };
}
