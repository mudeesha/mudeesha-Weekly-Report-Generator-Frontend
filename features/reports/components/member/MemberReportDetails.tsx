'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/primitives';
import { ReportDetailOverview } from '@/features/reports/components/shared/ReportDetailOverview';
import { submitReport } from '@/services/report.service';
import { errorMessage } from '@/lib/api-client';
import { validateDraft } from '@/features/reports/validation';
import { isEditableStatus } from '@/lib/format';

import type {
  Project,
  ReportVersion,
  User,
  WeeklyReport,
} from '@/types';

export function MemberReportDetails({
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
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const editable = isEditableStatus(report.status);

  async function submit() {
    const message = validateDraft(
      {
        weekStart: report.periodStart,
        ...report.currentVersion,
      },
      true
    );

    if (message) {
      setActionError(message);
      return;
    }

    if (
      !window.confirm(
        'Submit this report for review? You cannot edit it unless changes are requested.'
      )
    ) {
      return;
    }

    setBusy(true);
    setActionError('');

    try {
      await onUpdated(await submitReport(report.id));
      toast.success('Report submitted.');
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {actionError && (
        <p
          role="alert"
          className="mb-3 text-[11px] text-error-600"
        >
          {actionError}
        </p>
      )}

      <ReportDetailOverview
        report={report}
        versions={versions}
        projects={projects}
        users={users}
        owner={owner}
        actions={
          <>
            <Link
              href="/reports"
              className="wr-action"
              title="Back"
              aria-label="Back to reports"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>

            {editable && (
              <Link
                href={`/reports/${report.id}/edit`}
                className="wr-action"
                title="Edit report"
                aria-label="Edit report"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </Link>
            )}

            {editable && (
              <Button
                size="sm"
                disabled={busy}
                onClick={() => void submit()}
              >
                <Send className="h-3.5 w-3.5" />
                {busy ? 'Submitting…' : 'Submit'}
              </Button>
            )}
          </>
        }
      />
    </>
  );
}