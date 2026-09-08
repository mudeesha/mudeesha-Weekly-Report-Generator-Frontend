'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { ConfirmDialog, Dialog } from '@/components/ui/Dialog';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { RowActions } from '@/components/ui/data-table/RowActions';
import { PriorityBadge, TaskStatusBadge } from '@/components/common/StatusBadge';
import { TaskDialog } from '@/features/reports/components/member/TaskDialog';
import { SafeNotes } from './ReportText';
import { useData } from '@/providers/DataProvider';
import { TASK_TYPE_LABELS } from '@/types';
import type { Project, ReportTask, TaskSection } from '@/types';

export function TaskTable({ tasks, onChange, readOnly = false, section = 'THIS_WEEK', projects = [], disabled = false }: { tasks: ReportTask[]; onChange?: (tasks: ReportTask[]) => void; readOnly?: boolean; section?: TaskSection; projects?: Project[]; disabled?: boolean }) {
  const { getProjectById } = useData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ReportTask | null>(null);
  const [viewing, setViewing] = useState<ReportTask | null>(null);
  const [deleting, setDeleting] = useState<ReportTask | null>(null);
  const editable = !readOnly && !!onChange;
  const projectName = (id: string) => projects.find(project => project.id === id)?.name || getProjectById(id)?.name || `Project ${id}`;
  const columns: ColumnDef<ReportTask>[] = [
    { accessorKey: 'name', header: 'Task / deliverable', cell: ({ row: { original: task } }) => <div><p className="wr-entry-title" title={task.name}>{task.name}</p>{task.output && <p className="wr-entry-excerpt" title={task.output}>{task.output}</p>}</div> },
    { id: 'project', accessorFn: task => projectName(task.projectId), header: 'Project / type', cell: ({ row: { original: task } }) => <div><p className="max-w-[190px] truncate text-[11px]" title={projectName(task.projectId)}>{projectName(task.projectId)}</p><p className="mt-0.5 text-[10px] text-[#817a92]">{TASK_TYPE_LABELS[task.taskType]}</p></div> },
    { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <PriorityBadge priority={row.original.priority} /> },
    { accessorKey: 'plannedPercent', header: 'Planned %', cell: ({ row }) => row.original.plannedPercent === null ? '—' : `${row.original.plannedPercent}%` },
    { accessorKey: 'actualPercent', header: 'Actual %', cell: ({ row: { original: task } }) => <div className="flex items-center gap-2"><span>{task.actualPercent === null ? '—' : `${task.actualPercent}%`}</span>{task.actualPercent !== null && <span className="h-1 w-10 overflow-hidden rounded-full bg-[#ece8f7]"><span className="block h-full bg-[#594dba]" style={{ width: `${Math.min(task.actualPercent, 100)}%` }} /></span>}</div> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <TaskStatusBadge status={row.original.status} /> },
    { accessorKey: 'plannedHours', header: 'Planned', cell: ({ row }) => row.original.plannedHours === null ? '—' : `${row.original.plannedHours}h` },
    { accessorKey: 'spentHours', header: 'Spent', cell: ({ row }) => row.original.spentHours === null ? '—' : `${row.original.spentHours}h` },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <RowActions name={row.original.name} disabled={disabled} onView={() => setViewing(row.original)} onEdit={editable ? () => { setEditing(row.original); setOpen(true); } : undefined} onDelete={editable ? () => setDeleting(row.original) : undefined} /> },
  ];
  return <>
    <DataTable label={section === 'THIS_WEEK' ? 'Current-week tasks' : 'Next-week tasks'} data={tasks} columns={columns} embedded pageSize={5} minWidth={1020} getRowId={task => task.id} searchText={task => `${task.name} ${task.output || ''} ${projectName(task.projectId)} ${TASK_TYPE_LABELS[task.taskType]} ${task.status || ''}`} searchPlaceholder="Search tasks…" actions={editable && <Button size="sm" variant="outline" disabled={disabled || !projects.length} onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-3.5 w-3.5" />Add task</Button>} emptyMessage="No tasks added" emptyDescription={editable ? projects.length ? 'Use Add task to record an entry.' : 'Ask a manager to assign you to a project first.' : 'No tasks recorded in this section.'} />
    <Dialog open={!!viewing} onClose={() => setViewing(null)} title="Task details" size="lg" footer={<Button size="sm" variant="outline" onClick={() => setViewing(null)}>Close</Button>}>
      {viewing && <div className="space-y-4"><h3 className="break-words text-[14px] font-semibold">{viewing.name}</h3><dl className="grid grid-cols-2 gap-4 text-[12px]">
        <div><dt className="text-[11px] text-[#817a92]">Project</dt><dd className="mt-1">{projectName(viewing.projectId)}</dd></div>
        <div><dt className="text-[11px] text-[#817a92]">Type</dt><dd className="mt-1">{TASK_TYPE_LABELS[viewing.taskType]}</dd></div>
        <div><dt className="mb-1 text-[11px] text-[#817a92]">Priority</dt><dd><PriorityBadge priority={viewing.priority} /></dd></div>
        <div><dt className="mb-1 text-[11px] text-[#817a92]">Status</dt><dd><TaskStatusBadge status={viewing.status} /></dd></div>
        <div><dt className="text-[11px] text-[#817a92]">Planned / actual progress</dt><dd className="mt-1">{viewing.plannedPercent === null ? '—' : `${viewing.plannedPercent}%`} / {viewing.actualPercent === null ? '—' : `${viewing.actualPercent}%`}</dd></div>
        <div><dt className="text-[11px] text-[#817a92]">Planned / spent hours</dt><dd className="mt-1">{viewing.plannedHours ?? '—'} / {viewing.spentHours ?? '—'}</dd></div>
      </dl><div className="border-t pt-3"><p className="mb-1 text-[11px] font-medium">Output / deliverable</p><SafeNotes text={viewing.output || 'No output recorded.'} /></div></div>}
    </Dialog>
    {editable && <>
      <TaskDialog open={open} task={editing} section={section} projects={projects} onClose={() => setOpen(false)} onSave={task => { if (!disabled) onChange?.(editing ? tasks.map(item => item.id === task.id ? task : item) : [...tasks, task]); }} />
      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} title="Delete task" description={`Remove “${deleting?.name || ''}” from this editable version?`} confirmLabel="Delete task" loading={disabled} onConfirm={() => { if (deleting && !disabled) onChange?.(tasks.filter(task => task.id !== deleting.id)); setDeleting(null); }} />
    </>}
  </>;
}
