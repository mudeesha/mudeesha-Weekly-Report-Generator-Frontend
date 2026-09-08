'use client';

import { useEffect, useId, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button, Input, Label, Select, Textarea } from '@/components/ui/primitives';
import { reportEntryError } from '@/features/reports/editor-items';

export interface ReportEntryDraft { id?: string; title: string; description: string; status: 'OPEN' | 'RESOLVED'; isKey: boolean; }
const blank: ReportEntryDraft = { title: '', description: '', status: 'OPEN', isKey: false };
export function ReportEntryDialog({ open, kind, initial, onClose, onSave, disabled = false }: { open: boolean; kind: 'blocker' | 'achievement'; initial: ReportEntryDraft | null; onClose: () => void; onSave: (value: ReportEntryDraft) => void; disabled?: boolean }) {
  const id = useId();
  const [value, setValue] = useState<ReportEntryDraft>(blank);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (open) { setValue(initial ? { ...initial } : { ...blank }); setError(null); } }, [open, initial]);
  function save() {
    if (disabled) return;
    const issue = reportEntryError(value.title, value.description);
    setError(issue);
    if (issue) return;
    onSave({ ...value, title: value.title.trim() });
    onClose();
  }
  return <Dialog open={open} onClose={onClose} title={`${initial ? 'Edit' : 'Add'} ${kind}`} description="Changes are added to this report. Use Save draft or Submit to save them to the backend." size="md" footer={<><Button size="sm" variant="outline" disabled={disabled} onClick={onClose}>Cancel</Button><Button size="sm" disabled={disabled} type="submit" form={`${id}-form`}>{initial ? 'Save' : 'Add'} {kind}</Button></>}>
    <form id={`${id}-form`} onSubmit={event => { event.preventDefault(); save(); }} className="space-y-3">
      <div><Label htmlFor={`${id}-title`} required>Title</Label><Input id={`${id}-title`} value={value.title} minLength={2} maxLength={255} required disabled={disabled} onChange={event => setValue(current => ({ ...current, title: event.target.value }))} /></div>
      <div><Label htmlFor={`${id}-details`}>Supporting details</Label><Textarea id={`${id}-details`} rows={4} maxLength={10000} disabled={disabled} value={value.description} onChange={event => setValue(current => ({ ...current, description: event.target.value }))} /></div>
      {kind === 'blocker' && <div><Label htmlFor={`${id}-status`}>Status</Label><Select id={`${id}-status`} disabled={disabled} value={value.status} onChange={event => setValue(current => ({ ...current, status: event.target.value as 'OPEN' | 'RESOLVED' }))}><option value="OPEN">Open</option><option value="RESOLVED">Resolved</option></Select></div>}
      <label className="flex items-center gap-2 text-[12px]"><input type="checkbox" disabled={disabled} checked={value.isKey} onChange={event => setValue(current => ({ ...current, isKey: event.target.checked }))} className="accent-[#594dba]" />{kind === 'blocker' ? 'Key issue' : 'Key achievement'}</label>
      <p className="text-[11px] text-[#817a92]">Selecting this replaces the previous key {kind === 'blocker' ? 'issue' : 'achievement'} in this version.</p>
      {error && <p role="alert" className="text-[12px] text-error-700">{error}</p>}
    </form>
  </Dialog>;
}
