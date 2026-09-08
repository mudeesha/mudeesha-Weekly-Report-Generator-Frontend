'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button, HelperText, Input, Label, Select, Textarea } from '@/components/ui/primitives';
import { TASK_TYPE_LABELS } from '@/types';
import type { Priority, Project, ReportTask, TaskSection, TaskStatus, TaskTypeCode } from '@/types';
import { priorityLabel, taskStatusLabel } from '@/lib/format';
import { taskErrors } from '@/features/reports/validation';
function emptyTask(section: TaskSection): ReportTask { return { id: crypto.randomUUID(), projectId: '', section, taskType: 'DEVELOPMENT', name: '', priority: null, plannedPercent: null, actualPercent: null, status: null, plannedHours: null, spentHours: null, output: null }; }
export function TaskDialog({ open, task, section, projects, onClose, onSave }: {
  open: boolean;
  task: ReportTask | null;
  section: TaskSection;
  projects: Project[];
  onClose: () => void;
  onSave: (task: ReportTask) => void;
}) {
  const [draft, setDraft] = useState<ReportTask>(() => emptyTask(section));
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (open) {
      setDraft(task ? { ...task } : emptyTask(section));
      setErrors({});
    }
  }, [open, task, section]);
  function set<K extends keyof ReportTask>(key: K, value: ReportTask[K]) { setDraft(d => ({ ...d, [key]: value })); }
  function save() {
    const next = taskErrors(draft); setErrors(next); if (Object.keys(next).length)
      return; onSave({ ...draft, name: draft.name.trim(), output: draft.output?.trim() || null }); onClose();
  }
  function numberInput(key: 'plannedPercent' | 'actualPercent' | 'plannedHours' | 'spentHours', label: string) {
    const percent = key.endsWith('Percent');
    return <div>
      <Label htmlFor={`task-${key}`}>
        {label}
      </Label>
      <Input
        id={`task-${key}`}
        type="number"
        min={0}
        max={percent ? 100 : 9999.99}
        step={percent ? 1 : 0.01}
        value={draft[key] ?? ''}
        error={!!errors[key]}
        onChange={e => set(key, e.target.value === '' ? null : Number(e.target.value))} />
      {errors[key] && <HelperText error>
        {errors[key]}
      </HelperText>}
    </div>;
  }
  return <Dialog
    open={open}
    onClose={onClose}
    title={task ? 'Edit Task' : 'Add Task'}
    description={section === 'THIS_WEEK' ? 'Work performed during this reporting week, including work still in progress.' : 'Planned work for next week. Actual progress and time can be left blank.'}
    size="lg"
    footer={<>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={save}>
        {task ? 'Save task' : 'Add task'}
      </Button>
    </>}>
    <div className="grid gap-5">
      <div>
        <Label htmlFor="task-name" required>Task name</Label>
        <Input id="task-name" value={draft.name} maxLength={255} error={!!errors.name} onChange={e => set('name', e.target.value)} placeholder="Describe the work" />
        {errors.name && <HelperText error>
          {errors.name}
        </HelperText>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="task-project" required>Project / category</Label>
          <Select id="task-project" value={draft.projectId} onChange={e => set('projectId', e.target.value)} error={!!errors.projectId}>
            <option value="">Select assigned project</option>
            {projects.map(p => <option key={p.id} value={p.id}>
              {p.name}
            </option>)}
          </Select>
          {errors.projectId && <HelperText error>
            {errors.projectId}
          </HelperText>}
        </div>
        <div>
          <Label htmlFor="task-type" required>Task type</Label>
          <Select id="task-type" value={draft.taskType} onChange={e => set('taskType', e.target.value as TaskTypeCode)}>
            {Object.entries(TASK_TYPE_LABELS).map(([code, label]) => <option key={code} value={code}>
              {label}
            </option>)}
          </Select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="task-priority">Priority</Label>
          <Select id="task-priority" value={draft.priority || ''} onChange={e => set('priority', (e.target.value || null) as Priority | null)}>
            <option value="">Not set</option>
            {Object.entries(priorityLabel).map(([code, label]) => <option key={code} value={code}>
              {label}
            </option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="task-status">Status</Label>
          <Select id="task-status" value={draft.status || ''} onChange={e => set('status', (e.target.value || null) as TaskStatus | null)}>
            <option value="">Not set</option>
            {Object.entries(taskStatusLabel).map(([code, label]) => <option key={code} value={code}>
              {label}
            </option>)}
          </Select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {numberInput('plannedPercent', 'Planned %')}
        {numberInput('actualPercent', 'Actual %')}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {numberInput('plannedHours', 'Planned time (hours)')}
        {numberInput('spentHours', 'Spent time this week (hours)')}
      </div>
      <div>
        <Label htmlFor="task-output">Output / deliverable</Label>
        <Textarea
          id="task-output"
          value={draft.output || ''}
          rows={3}
          maxLength={10000}
          onChange={e => set('output', e.target.value)}
          placeholder="Results, ticket references or deliverable links" />
        <HelperText>Drafts may be incomplete. Current-week progress and time are required at submission.</HelperText>
      </div>
    </div>
  </Dialog>;
}
