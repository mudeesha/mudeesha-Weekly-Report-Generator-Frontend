import { queryString, request } from '@/lib/api-client';
import { activityFromApi } from '@/lib/api-adapters';
import { filterQuery } from '@/services/report.service';
import type { ApiActivity, ApiSummary } from '@/lib/api-contracts';
import type { ReportFilters, SummaryCounts } from '@/types';
export async function getSummary(filters: ReportFilters = {}, signal?: AbortSignal): Promise<SummaryCounts> {
  const r = await request<ApiSummary>(`/dashboard/summary${queryString(filterQuery(filters))}`, { signal });
  return { totalReports: r.total_reports, draftReports: r.draft_reports, submittedReports: r.submitted_reports, needsCorrectionReports: r.needs_correction_reports, approvedReports: r.approved_reports, totalSpentHours: r.total_spent_hours };
}
export function getStatusDistribution(filters: ReportFilters = {}, signal?: AbortSignal) {
  return request<{
    status: string;
    count: number;
  }[]>(`/dashboard/status-distribution${queryString(filterQuery(filters))}`, { signal });
}
export function getProjectHours(filters: ReportFilters = {}, signal?: AbortSignal) {
  return request<{
    project_id: number;
    project_name: string;
    spent_hours: number;
  }[]>(`/dashboard/hours-by-project${queryString(filterQuery(filters))}`, { signal });
}
export async function getActivities(limit = 10, filters: ReportFilters = {}, signal?: AbortSignal) { return (await request<ApiActivity[]>(`/dashboard/activity${queryString({ ...filterQuery(filters), limit })}`, { signal })).map(activityFromApi); }
