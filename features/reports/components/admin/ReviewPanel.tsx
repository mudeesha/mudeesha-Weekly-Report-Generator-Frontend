'use client';

import { useState } from 'react';
import { CheckCircle2, FileCheck2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/Dialog';
import { Badge, Button, Label, Textarea } from '@/components/ui/primitives';
import { approveReport, requestChanges } from '@/services/report.service';
import { errorMessage } from '@/lib/api-client';
import { reportStatusLabel } from '@/lib/format';
import type { WeeklyReport } from '@/types';

export function ReviewPanel({ report, onUpdated }: { report: WeeklyReport; onUpdated: (report: WeeklyReport) => void }) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const actionable = report.status === 'SUBMITTED';

  async function review(action: 'approve' | 'changes') {
    const trimmed = comment.trim();
    if (action === 'changes' && (trimmed.length < 2 || trimmed.length > 2000)) {
      setError('Explain the requested correction in 2–2,000 characters.');
      return;
    }
    if (action === 'approve' && !window.confirm(`Approve Version ${report.currentVersion.versionNumber}? This report will become read-only.`)) return;
    setBusy(true);
    setError('');
    try {
      const next = action === 'approve' ? await approveReport(report.id) : await requestChanges(report.id, trimmed);
      onUpdated(next);
      setComment('');
      setOpen(false);
      toast.success(action === 'approve' ? 'Report approved.' : 'Changes requested. The member can edit the new version.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => { setOpen(true); setError(''); }}>
        <FileCheck2 className="h-3.5 w-3.5" />Take Action
      </Button>
      <Dialog
        open={open}
        onClose={() => { if (!busy) setOpen(false); }}
        title="Take Action on Report"
        description={`Week ${report.weekNumber} · ${report.year} · Version ${report.currentVersion.versionNumber}`}
        size="md"
        footer={actionable ? (
          <>
            <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="outline" disabled={busy} onClick={() => void review('changes')}><MessageSquare className="h-3.5 w-3.5" />Request changes</Button>
            <Button disabled={busy} onClick={() => void review('approve')}><CheckCircle2 className="h-3.5 w-3.5" />{busy ? 'Saving…' : 'Approve report'}</Button>
          </>
        ) : <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Close</Button>}
      >
        <div className="space-y-4">
          <div className="rounded-[9px] border border-[#e3dfeb] bg-[#f8f6fb] px-3.5 py-3">
            <p className="text-[9px] font-medium uppercase tracking-[.08em] text-[#938ca2]">Current status</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <strong className="text-[14px] text-[#3c3374]">{reportStatusLabel[report.status]}</strong>
              <Badge tone={report.status === 'APPROVED' ? 'success' : report.status === 'NEEDS_CORRECTION' ? 'warning' : report.status === 'SUBMITTED' ? 'brand' : 'neutral'}>Version {report.currentVersion.versionNumber}</Badge>
            </div>
          </div>

          {actionable ? (
            <div>
              <Label htmlFor="review-comment">Manager comment</Label>
              <Textarea id="review-comment" rows={5} value={comment} maxLength={2000} onChange={e => setComment(e.target.value)} placeholder="Add a correction comment…" disabled={busy} />
              <p className="mt-1 text-[10px] text-[#9a93a8]">A comment is required when requesting changes. Approval uses the existing approval action without storing an additional comment.</p>
            </div>
          ) : (
            <p className="text-[11px] leading-5 text-[#817a92]">
              {report.status === 'APPROVED' ? 'This report is already approved. No further review action is available.' : report.status === 'NEEDS_CORRECTION' ? 'The member is currently correcting this report. Wait for the next submission before taking another review action.' : 'Only submitted reports can be reviewed.'}
            </p>
          )}
          {error && <p role="alert" className="text-[10px] text-error-600">{error}</p>}
        </div>
      </Dialog>
    </>
  );
}
