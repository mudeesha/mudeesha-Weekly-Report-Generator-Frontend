'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ReviewPanel } from '@/features/reports/components/admin/ReviewPanel';
import { ReportDetailOverview } from '@/features/reports/components/shared/ReportDetailOverview';

import type {
  Project,
  ReportVersion,
  User,
  WeeklyReport,
} from '@/types';

export function AdminReportDetails({
  report,
  versions,
  projects,
  users,
  owner,
  onUpdated,
}: {
  report: WeeklyReport;
  versions: ReportVersion[];
  projects: Project[];
  users: User[];
  owner: string;
  onUpdated: (report: WeeklyReport) => Promise<void>;
}) {
  const banner =
    report.status === 'NEEDS_CORRECTION'
      ? 'The team member is editing a correction. You are viewing the last submitted version.'
      : undefined;

  return (
    <ReportDetailOverview
      report={report}
      versions={versions}
      projects={projects}
      users={users}
      owner={owner}
      banner={banner}
      actions={
        <>
          <Link
            href="/team-reports"
            className="wr-action"
            title="Back"
            aria-label="Back to reports"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>

          <ReviewPanel
            report={report}
            onUpdated={next => {
              void onUpdated(next);
            }}
          />
        </>
      }
    />
  );
}