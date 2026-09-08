import type { ReportDraft, ReportTask } from '@/types';
import { mondayOf } from '@/lib/format';
export function taskErrors(task: ReportTask): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!/^[1-9]\d*$/.test(task.projectId))
    errors.projectId = 'Select an assigned project.';
  if (task.name.trim().length < 2 || task.name.trim().length > 255)
    errors.name = 'Use 2–255 characters for the task name.';
  for (const key of ['plannedPercent', 'actualPercent'] as const) {
    const value = task[key];
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 100))
      errors[key] = 'Use a whole number from 0 to 100.';
  }
  for (const key of ['plannedHours', 'spentHours'] as const) {
    const value = task[key];
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 9999.99 || Math.abs(value * 100 - Math.round(value * 100)) > 0.00001))
      errors[key] = 'Use 0–9999.99 hours, with at most 2 decimal places.';
  }
  if (task.status === 'COMPLETED' && task.actualPercent !== null && task.actualPercent !== 100)
    errors.actualPercent = 'Completed tasks should have 100% actual progress.';
  return errors;
}
export function validateDraft(draft: ReportDraft, submitting: boolean): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.weekStart) || !Number.isFinite(Date.parse(draft.weekStart)) || mondayOf(draft.weekStart) !== draft.weekStart)
    return 'Choose a Monday as the reporting week start.';
  for (const task of draft.tasks) {
    const errors = Object.values(taskErrors(task));
    if (errors.length)
      return `${task.name || 'Task'}: ${errors[0]}`;
  }
  if (draft.blockers.some(b => b.title.trim().length < 2 || b.title.trim().length > 255))
    return 'Each blocker needs a title of 2–255 characters.';
  if (draft.achievements.some(a => a.title.trim().length < 2 || a.title.trim().length > 255))
    return 'Each achievement needs a title of 2–255 characters.';
  if (draft.blockers.filter(b => b.isKeyIssue).length > 1)
    return 'Only one blocker can be the key issue.';
  if (draft.achievements.filter(a => a.isKeyAchievement).length > 1)
    return 'Only one achievement can be the key achievement.';
  if (submitting) {
    const current = draft.tasks.filter(t => t.section === 'THIS_WEEK');
    if (!current.length)
      return 'Add at least one current-week task before submitting.';
    if (current.some(t => [t.priority, t.plannedPercent, t.actualPercent, t.status, t.plannedHours, t.spentHours].some(v => v === null)))
      return 'Complete priority, progress, status, planned hours and spent hours for every current-week task before submitting.';
  }
  return null;
}
