'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { Button, Label, Textarea } from '@/components/ui/primitives';
import { SafeNotes } from './ReportText';

export function NotesTable({ notes, onChange, disabled = false }: { notes: string | null; onChange?: (notes: string | null) => void; disabled?: boolean }) {
  const [mode, setMode] = useState<'edit' | 'view' | null>(null);
  const [draft, setDraft] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const hasNotes = !!notes?.trim();
  const rows = hasNotes ? [{ id: 'notes', text: notes! }] : [];
  function openEdit() { setDraft(notes || ''); setError(''); setMode('edit'); }
  function save() {
    if (disabled) return;
    if (!draft.trim()) { setError('Enter notes, or cancel and use Delete to remove the existing notes.'); return; }
    if (draft.length > 10000) { setError('Notes must not exceed 10,000 characters.'); return; }
    onChange?.(draft);
    setMode(null);
  }
  const columns: ColumnDef<{ id: string; text: string }>[] = [
    { id: 'title', header: 'Entry', accessorFn: () => 'Notes and reference links', cell: () => <span className="font-medium">Notes and reference links</span> },
    { accessorKey: 'text', header: 'Preview', cell: ({ row }) => <p className="wr-entry-excerpt !mt-0" title={row.original.text}>{row.original.text}</p> },
    { id: 'actions', header: 'Actions', cell: () => <RowActions name="notes" disabled={disabled} onView={() => setMode('view')} onEdit={onChange ? openEdit : undefined} onDelete={onChange ? () => setDeleting(true) : undefined} /> },
  ];
  return <>
    <DataTable label="Notes" data={rows} columns={columns} embedded minWidth={560} paginate={false} getRowId={row => row.id} searchText={row => row.text} searchPlaceholder="Search notes…" actions={onChange && !hasNotes && <Button size="sm" variant="outline" disabled={disabled} onClick={openEdit}><Plus className="h-3.5 w-3.5" />Add notes</Button>} emptyMessage="No notes added" emptyDescription="Optional context and reference links for this report version." />
    <Dialog open={mode !== null} onClose={() => setMode(null)} title={mode === 'view' ? 'Notes and reference links' : hasNotes ? 'Edit notes' : 'Add notes'} description={mode === 'edit' ? 'Notes remain one text field per report version. Save the report to persist changes.' : undefined} size="lg" footer={mode === 'view' ? <Button size="sm" variant="outline" onClick={() => setMode(null)}>Close</Button> : <><Button size="sm" variant="outline" onClick={() => setMode(null)} disabled={disabled}>Cancel</Button><Button size="sm" onClick={save} disabled={disabled}>Save notes</Button></>}>
      {mode === 'view' ? <SafeNotes text={notes || ''} /> : <div><Label htmlFor="report-notes-editor" required>Notes and links</Label><Textarea id="report-notes-editor" value={draft} onChange={event => setDraft(event.target.value)} maxLength={10000} rows={7} disabled={disabled} /><p className="mt-1 text-right text-[10px] text-[#817a92]">{draft.length.toLocaleString()} / 10,000</p>{error && <p role="alert" className="mt-2 text-[12px] text-error-700">{error}</p>}</div>}
    </Dialog>
    <ConfirmDialog open={deleting} onClose={() => setDeleting(false)} title="Delete notes" description="Remove the notes from this editable version? Previous submitted versions are unchanged." confirmLabel="Delete notes" loading={disabled} onConfirm={() => { if (!disabled) { onChange?.(null); setDeleting(false); } }} />
  </>;
}
