'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { Badge, Button } from '@/components/ui/primitives';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { TableFilter } from '@/components/ui/data-table/TableFilter';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { ReportEntryDialog } from '../member/ReportEntryDialog';
import type { ReportEntryDraft } from '../member/ReportEntryDialog';
import { saveAchievement, saveBlocker } from '@/features/reports/editor-items';
import { SafeNotes } from './ReportText';
import type { ReportAchievement, ReportBlocker } from '@/types';

type Item = ReportAchievement | ReportBlocker;
type Props = { disabled?: boolean } & ({ kind: 'blocker'; items: ReportBlocker[]; onChange?: (items: ReportBlocker[]) => void } | { kind: 'achievement'; items: ReportAchievement[]; onChange?: (items: ReportAchievement[]) => void });
const isKey = (item: Item) => 'isKeyIssue' in item ? item.isKeyIssue : item.isKeyAchievement;

export function ReportItemsTable(props: Props) {
  const { kind, items, disabled = false } = props;
  const editable = !!props.onChange;
  const [form, setForm] = useState<{ initial: ReportEntryDraft | null } | null>(null);
  const [viewing, setViewing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [filter, setFilter] = useState('');
  function edit(item: Item) { setForm({ initial: { id: item.id, title: item.title, description: item.description || '', status: 'status' in item ? item.status : 'OPEN', isKey: isKey(item) } }); }
  function save(value: ReportEntryDraft) {
    if (disabled) return;
    const base = { id: value.id || crypto.randomUUID(), title: value.title, description: value.description || null };
    if (props.kind === 'blocker') props.onChange?.(saveBlocker(props.items, { ...base, status: value.status, isKeyIssue: value.isKey }));
    else props.onChange?.(saveAchievement(props.items, { ...base, isKeyAchievement: value.isKey }));
  }
  function remove() {
    if (!deleting || disabled) return;
    if (props.kind === 'blocker') props.onChange?.(props.items.filter(item => item.id !== deleting.id));
    else props.onChange?.(props.items.filter(item => item.id !== deleting.id));
    setDeleting(null);
  }
  const columns: ColumnDef<Item>[] = [
    { accessorKey: 'title', header: 'Title', cell: ({ row }) => <p className="wr-entry-title" title={row.original.title}>{row.original.title}</p> },
    { accessorKey: 'description', header: 'Supporting details', cell: ({ row }) => <p className="wr-entry-excerpt !mt-0" title={row.original.description || undefined}>{row.original.description || '—'}</p> },
    ...(kind === 'blocker' ? [{ id: 'status', accessorFn: (item: Item) => 'status' in item ? item.status : '', header: 'Status', cell: ({ row }: { row: { original: Item } }) => <Badge tone={'status' in row.original && row.original.status === 'OPEN' ? 'warning' : 'success'}>{'status' in row.original && row.original.status === 'OPEN' ? 'Open' : 'Resolved'}</Badge> }] : []),
    { id: 'key', accessorFn: item => isKey(item) ? 'Key' : 'Standard', header: kind === 'blocker' ? 'Key issue' : 'Highlight', cell: ({ row }) => isKey(row.original) ? <Badge tone={kind === 'blocker' ? 'warning' : 'success'}>{kind === 'blocker' ? 'Key issue' : 'Key achievement'}</Badge> : <span className="text-[#817a92]">—</span> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <RowActions name={row.original.title} disabled={disabled} onView={() => setViewing(row.original)} onEdit={editable ? () => edit(row.original) : undefined} onDelete={editable ? () => setDeleting(row.original) : undefined} /> },
  ];
  const filtered: Item[] = items.filter(item => !filter || (filter === 'KEY' ? isKey(item) : 'status' in item && item.status === filter));
  return <>
    <DataTable label={kind === 'blocker' ? 'Blockers' : 'Achievements'} data={filtered} columns={columns} embedded pageSize={5} minWidth={kind === 'blocker' ? 760 : 680} getRowId={item => item.id} resetKey={filter} searchText={item => `${item.title} ${item.description || ''}`} searchPlaceholder={`Search ${kind}s…`} onReset={() => setFilter('')} filters={<TableFilter label={kind === 'blocker' ? 'Blocker filter' : 'Achievement filter'} value={filter} onChange={setFilter}><option value="">All {kind}s</option><option value="KEY">Key {kind === 'blocker' ? 'issue' : 'achievement'}</option>{kind === 'blocker' && <><option value="OPEN">Open</option><option value="RESOLVED">Resolved</option></>}</TableFilter>} actions={editable && <Button size="sm" variant="outline" disabled={disabled} onClick={() => setForm({ initial: null })}><Plus className="h-3.5 w-3.5" />Add {kind}</Button>} emptyMessage={`No ${kind}s added`} emptyDescription={editable ? `Use Add ${kind} to create an entry.` : `No ${kind}s recorded in this version.`} />
    <Dialog open={!!viewing} onClose={() => setViewing(null)} title={kind === 'blocker' ? 'Blocker details' : 'Achievement details'} footer={<Button size="sm" variant="outline" onClick={() => setViewing(null)}>Close</Button>}>
      {viewing && <div className="space-y-3"><h3 className="break-words text-[14px] font-semibold">{viewing.title}</h3><div className="flex gap-2">{'status' in viewing && <Badge tone={viewing.status === 'OPEN' ? 'warning' : 'success'}>{viewing.status === 'OPEN' ? 'Open' : 'Resolved'}</Badge>}{isKey(viewing) && <Badge tone="brand">{kind === 'blocker' ? 'Key issue' : 'Key achievement'}</Badge>}</div><SafeNotes text={viewing.description || 'No supporting details.'} /></div>}
    </Dialog>
    {editable && <><ReportEntryDialog open={!!form} kind={kind} initial={form?.initial || null} disabled={disabled} onClose={() => setForm(null)} onSave={save} /><ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title={`Delete ${kind}`} description={`Remove “${deleting?.title || ''}” from this editable version?`} confirmLabel={`Delete ${kind}`} loading={disabled} onConfirm={remove} /></>}
  </>;
}
