import type { ApiActivity, ApiProject, ApiReport, ApiReportSummary, ApiReview, ApiTask, ApiUser, ApiVersion } from '@/lib/api-contracts';
import type { Activity, Project, ReportDraft, ReportListItem, ReportTask, ReportVersion, ReviewComment, User, WeeklyReport, TimePoint } from '@/types';
import { TASK_TYPES, TASK_TYPE_LABELS } from '@/types';
import { isoWeek, roundHours } from '@/lib/format';
import { numericId } from '@/lib/api-client';
export function userFromApi(user: ApiUser): User { return { id: String(user.id), name: user.name, email: user.email, role: user.role, isActive: user.is_active ?? true, projectIds: [] }; }
export function projectFromApi(p: ApiProject): Project { return { id: String(p.id), name: p.name, description: p.description, members: p.members.map(u => ({ userId: String(u.id), name: u.name, email: u.email, role: u.role })) }; }
function decimal(value: number | string | null): number | null {
  if (value === null)
    return null;
  const result = Number(value);
  if (!Number.isFinite(result))
    throw new Error('The API returned an invalid numeric value.');
  return result;
}
export function taskFromApi(t: ApiTask): ReportTask { return { id: String(t.id), projectId: String(t.project_id), section: t.section, taskType: t.task_type, name: t.name, priority: t.priority, plannedPercent: t.planned_percent, actualPercent: t.actual_percent, status: t.status, plannedHours: decimal(t.planned_hours), spentHours: decimal(t.spent_hours), output: t.output }; }
export function reviewFromApi(r: ApiReview): ReviewComment { return { id: String(r.id), reportVersionId: String(r.report_version_id), reviewerId: String(r.reviewer_id), action: r.action, comment: r.comment, createdAt: r.created_at }; }
export function versionFromApi(v: ApiVersion): ReportVersion {
  return {
    id: String(v.id), versionNumber: v.version_number, submittedAt: v.submitted_at, notes: v.notes, tasks: v.tasks.map(taskFromApi),
    blockers: v.blockers.map(b => ({ id: String(b.id), title: b.title, description: b.description, status: b.status, isKeyIssue: b.is_key_issue })),
    achievements: v.achievements.map(a => ({ id: String(a.id), title: a.title, description: a.description, isKeyAchievement: a.is_key_achievement })),
    reviews: (v.reviews || []).map(reviewFromApi)
  };
}
export function summaryFromApi(r: ApiReportSummary): ReportListItem {
  const week = isoWeek(r.week_start);
  return { id: String(r.id), userId: String(r.user_id), periodStart: r.week_start, periodEnd: r.week_end, dueAt: r.due_at, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, weekNumber: week.week, year: week.year };
}
export function reportFromApi(r: ApiReport): WeeklyReport { return { ...summaryFromApi(r), currentVersion: versionFromApi(r.current_version), latestReview: r.latest_review ? reviewFromApi(r.latest_review) : null }; }
export function draftToApi(draft: ReportDraft) {
  return {
    week_start: draft.weekStart, notes: draft.notes,
    tasks: draft.tasks.map(t => ({ project_id: numericId(t.projectId), section: t.section, task_type: t.taskType, name: t.name.trim(), priority: t.priority, planned_percent: t.plannedPercent, actual_percent: t.actualPercent, status: t.status, planned_hours: t.plannedHours, spent_hours: t.spentHours, output: t.output })),
    blockers: draft.blockers.map(b => ({ title: b.title.trim(), description: b.description, status: b.status, is_key_issue: b.isKeyIssue })),
    achievements: draft.achievements.map(a => ({ title: a.title.trim(), description: a.description, is_key_achievement: a.isKeyAchievement }))
  };
}
export function hoursByType(tasks: ReportTask[]): TimePoint[] { return TASK_TYPES.map(type => ({ type, hours: roundHours(tasks.filter(t => t.section === 'THIS_WEEK' && TASK_TYPE_LABELS[t.taskType] === type).reduce((sum, t) => sum + (t.spentHours || 0), 0)) })); }
export function activityFromApi(a: ApiActivity): Activity { return { id: `${a.activity_type}-${a.report_id}-${a.version_number}-${a.created_at}`, activityType: a.activity_type, message: a.message, reportId: String(a.report_id), versionNumber: a.version_number, userId: String(a.user_id), userName: a.user_name, reviewerId: a.reviewer_id === null ? null : String(a.reviewer_id), reviewerName: a.reviewer_name, weekStart: a.week_start, createdAt: a.created_at }; }
