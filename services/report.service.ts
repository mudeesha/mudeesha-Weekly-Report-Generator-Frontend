import { ApiError, numericId, queryString, request } from '@/lib/api-client';
import { draftToApi, reportFromApi, summaryFromApi, versionFromApi } from '@/lib/api-adapters';
import type { ApiReport, ApiReportPage, ApiVersion } from '@/lib/api-contracts';
import type { ReportDraft, ReportFilters, ReportListItem, ReportPage } from '@/types';
import { mondayOf } from '@/lib/format';
export function filterQuery(filters: ReportFilters) { return { user_id: filters.userId, project_id: filters.projectId, status: filters.status, week_start_from: filters.from, week_start_to: filters.to }; }
export async function getReports(filters: ReportFilters = {}, page = 1, pageSize = 10, signal?: AbortSignal): Promise<ReportPage> {
  const r = await request<ApiReportPage>(`/reports${queryString({ ...filterQuery(filters), page, page_size: pageSize })}`, { signal });
  return { page: r.page, pageSize: r.page_size, total: r.total, items: r.items.map(summaryFromApi) };
}
/** Metadata only. Used by summary widgets; report tables use server pagination. */
export async function getAllReportSummaries(filters: ReportFilters = {}, signal?: AbortSignal): Promise<ReportListItem[]> {
  const records: ReportListItem[] = [];
  for (let page = 1; page <= 500; page++) {
    const result = await getReports(filters, page, 100, signal);
    records.push(...result.items);
    if (records.length >= result.total)
      return [...new Map(records.map(r => [r.id, r])).values()];
    if (!result.items.length)
      throw new ApiError('The report list changed while loading. Refresh to fetch a complete overview.', 409);
  }
  throw new ApiError('Too many reports for this overview. Narrow the date range.', 422);
}
export async function getReport(id: string, signal?: AbortSignal) { return reportFromApi(await request<ApiReport>(`/reports/${numericId(id)}`, { signal })); }
export async function getVersions(id: string, signal?: AbortSignal) { return (await request<ApiVersion[]>(`/reports/${numericId(id)}/versions`, { signal })).map(versionFromApi); }
export async function getVersion(id: string, version: number, signal?: AbortSignal) { return versionFromApi(await request<ApiVersion>(`/reports/${numericId(id)}/versions/${version}`, { signal })); }
export async function createReport(data: ReportDraft) { return reportFromApi(await request<ApiReport>('/reports', { method: 'POST', body: JSON.stringify(draftToApi(data)) })); }
export async function updateReport(id: string, data: ReportDraft, original?: ReportDraft) {
  const { week_start: _week, ...body } = draftToApi(data);
  const previous = original ? draftToApi(original) : undefined;
  const changes = Object.fromEntries(Object.entries(body).filter(([key, value]) =>
    !previous || JSON.stringify(previous[key as keyof typeof previous]) !== JSON.stringify(value)
  ));
  return reportFromApi(await request<ApiReport>(`/reports/${numericId(id)}`, { method: 'PATCH', body: JSON.stringify(changes) }));
}
export async function submitReport(id: string) { return reportFromApi(await request<ApiReport>(`/reports/${numericId(id)}/submit`, { method: 'POST' })); }
export async function approveReport(id: string) { return reportFromApi(await request<ApiReport>(`/reports/${numericId(id)}/approve`, { method: 'POST' })); }
export async function requestChanges(id: string, comment: string) { return reportFromApi(await request<ApiReport>(`/reports/${numericId(id)}/request-changes`, { method: 'POST', body: JSON.stringify({ comment: comment.trim() }) })); }
export function createEmptyReport(): ReportDraft { return { weekStart: mondayOf(), notes: '', tasks: [], blockers: [], achievements: [] }; }
