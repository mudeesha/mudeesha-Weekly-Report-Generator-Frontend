'use client';

import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from '@/lib/navigation';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useData } from '@/providers/DataProvider';
import { createEmptyReport, createReport, getReport, submitReport, updateReport } from '@/services/report.service';
import { errorMessage } from '@/lib/api-client';
import { useAsync } from '@/hooks/useAsync';
import { PageHeader } from '@/components/common/PageHeader';
import { ReportEditor } from '@/features/reports/components/member/ReportEditor';
import { ErrorState, TableSkeleton } from '@/components/common/states';
import { isEditableStatus } from '@/lib/format';
import type { ReportDraft } from '@/types';

export function ReportEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, loading: catalogueLoading, error: catalogueError, reload } = useData();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const loader = useCallback((signal: AbortSignal) => mode === 'edit' && id ? getReport(id, signal) : Promise.resolve(null), [mode, id]);
  const { data: report, loading, error, retry } = useAsync(loader);
  const initial = useMemo<ReportDraft>(() => report ? {
    weekStart: report.periodStart,
    notes: report.currentVersion.notes,
    tasks: report.currentVersion.tasks,
    blockers: report.currentVersion.blockers,
    achievements: report.currentVersion.achievements,
  } : createEmptyReport(), [report]);
  const availableProjects = projects.filter(project => project.members.some(member => member.userId === user?.id));

  if (!user) return null;
  if (error || catalogueError) return <ErrorState description={error || catalogueError || ''} onRetry={() => { retry(); void reload(); }} />;
  if (loading || catalogueLoading) return <TableSkeleton rows={6} />;
  if (mode === 'edit' && (!report || report.userId !== user.id || !isEditableStatus(report.status))) return <Navigate to={id ? `/reports/${id}` : '/reports'} replace />;

  async function save(draft: ReportDraft, submit: boolean) {
    setSaving(true);
    let savedId = mode === 'edit' ? id : undefined;
    try {
      const saved = savedId ? await updateReport(savedId, draft, initial) : await createReport(draft);
      savedId = saved.id;
      if (submit) await submitReport(savedId);
      await reload();
      toast.success(submit ? 'Report submitted for review.' : 'Draft saved.');
      navigate(`/reports/${savedId}${submit ? '' : '/edit'}`, { replace: true });
      if (!submit && mode === 'edit') retry();
    } catch (e) {
      toast.error(savedId && mode === 'create' ? `Draft saved. ${errorMessage(e)}` : errorMessage(e));
      if (savedId && mode === 'create') {
        await reload();
        navigate(`/reports/${savedId}/edit`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }

  return <>
    <PageHeader
      title={report ? `Edit Week ${report.weekNumber} Report` : 'Create Weekly Report'}
      subtitle="Record work, plans, blockers and achievements in the shared reporting format."
      crumbs={[{ label: 'My Reports', to: '/reports' }, { label: report ? 'Edit' : 'New report' }]}
    />
    {report?.status === 'NEEDS_CORRECTION' && report.latestReview?.action === 'REQUEST_CHANGES' && (
      <div className="mb-4 flex gap-3 rounded-[10px] border border-[#f0ddd5] bg-[#fff9f6] px-4 py-3">
        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-600" />
        <div>
          <p className="text-[12px] font-semibold text-[#4e4769]">Correction requested</p>
          <p className="mt-1 whitespace-pre-wrap text-[12px] leading-5 text-[#655d82]">{report.latestReview.comment}</p>
          <p className="mt-1.5 text-[10px] text-[#938ca2]">Editing version {report.currentVersion.versionNumber}. The earlier submitted version remains preserved.</p>
        </div>
      </div>
    )}
    <ReportEditor
      key={`${report?.id || 'new'}-${report?.updatedAt || ''}`}
      initial={initial}
      projects={availableProjects}
      saving={saving}
      status={report?.status || 'DRAFT'}
      isNew={mode === 'create'}
      onSaveDraft={draft => save(draft, false)}
      onSubmit={draft => save(draft, true)}
    />
  </>;
}
