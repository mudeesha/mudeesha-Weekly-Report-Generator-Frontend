import { aggregateAnalytics } from '@/features/analytics/analytics';
import { getAllReportSummaries, getReport, getVersions } from '@/services/report.service';
import { getActivities } from '@/services/dashboard.service';
import { ApiError } from '@/lib/api-client';
import type { Project, ReportFilters, User, ReportVersion } from '@/types';
async function mapConcurrent<T, R>(items: T[], map: (item: T) => Promise<R>, signal?: AbortSignal): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (next < items.length) {
      if (signal?.aborted)
        throw new DOMException('Aborted', 'AbortError');
      const index = next++;
      results[index] = await map(items[index]);
    }
  }));
  return results;
}
export async function getAnalyticsData(filters: ReportFilters, users: User[], projects: Project[], isManager: boolean, signal?: AbortSignal) {
  if (filters.from && filters.to && filters.from > filters.to)
    throw new ApiError('The start date cannot be after the end date.', 422);
  // The existing backend project filter uses unpublished versions. Apply project matching
  // to authorized detail responses instead, so private corrections cannot affect charts.
  const summaries = await getAllReportSummaries({ ...filters, projectId: undefined }, signal);
  const readable = summaries.filter(report => !isManager || report.status !== 'DRAFT');
  if (readable.length > 1000)
    throw new ApiError('Narrow the date range to analyse at most 1,000 reports.', 422);
  const rows = await mapConcurrent(readable, async (item) => {
    const [report, versions] = await Promise.all([getReport(item.id, signal), getVersions(item.id, signal)]);
    return { report, versions };
  }, signal);
  const histories: Record<string, ReportVersion[]> = Object.fromEntries(rows.map(row => [row.report.id, row.versions]));
  const activities = isManager ? await getActivities(10, filters, signal) : [];
  return aggregateAnalytics(summaries, rows.map(row => row.report), projects, users, activities, filters, histories);
}
