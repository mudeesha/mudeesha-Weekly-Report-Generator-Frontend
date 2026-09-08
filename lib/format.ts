import type { Priority, ReportStatus, TaskStatus, UserRole } from '@/types';
export function cn(...classes: (string | false | null | undefined)[]): string { return classes.filter(Boolean).join(' '); }
// Backend DATETIME fields are naive local Asia/Colombo values in the agreed implementation.
export const REPORT_TIME_ZONE = 'Asia/Colombo';
export function parseTimestamp(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value))
    return new Date(`${value}T00:00:00+05:30`);
  return new Date(/[zZ]$|[+-]\d\d:\d\d$/.test(value) ? value : `${value}+05:30`);
}
export function formatDate(value: string | null | undefined): string {
  if (!value)
    return '—';
  const d = parseTimestamp(value);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { timeZone: REPORT_TIME_ZONE, month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}
export function formatDateTime(value: string | null | undefined): string {
  if (!value)
    return 'Not submitted';
  const d = parseTimestamp(value);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { timeZone: REPORT_TIME_ZONE, month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
}
export function formatRange(start: string, end: string): string { return `${formatDate(start)} – ${formatDate(end)}`; }
export function relativeTime(value: string): string {
  const minutes = Math.floor((Date.now() - parseTimestamp(value).getTime()) / 60000);
  if (!Number.isFinite(minutes))
    return '—';
  if (minutes < 1)
    return 'Just now';
  if (minutes < 60)
    return `${minutes}m ago`;
  if (minutes < 1440)
    return `${Math.floor(minutes / 60)}h ago`;
  if (minutes < 10080)
    return `${Math.floor(minutes / 1440)}d ago`;
  return formatDate(value);
}
export const reportStatusLabel: Record<ReportStatus, string> = { DRAFT: 'Draft', SUBMITTED: 'Submitted', NEEDS_CORRECTION: 'Needs Correction', APPROVED: 'Approved' };
export const taskStatusLabel: Record<TaskStatus, string> = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', BLOCKED: 'Blocked' };
export const priorityLabel: Record<Priority, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
export const roleLabel: Record<UserRole, string> = { TEAM_MEMBER: 'Team Member', MANAGER: 'Manager', ADMIN: 'Admin' };
export function initials(name: string): string { return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase(); }
export function isEditableStatus(status: ReportStatus): boolean { return status === 'DRAFT' || status === 'NEEDS_CORRECTION'; }
export function roundHours(value: number): number { return Math.round((value + Number.EPSILON) * 100) / 100; }
export function todayDate(): string { return new Intl.DateTimeFormat('en-CA', { timeZone: REPORT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export function addDays(value: string, days: number): string { const d = new Date(`${value}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }
export function mondayOf(value: string = todayDate()): string { const d = new Date(`${value}T12:00:00Z`); return addDays(value, -((d.getUTCDay() + 6) % 7)); }
export function isoWeek(value: string): {
  week: number;
  year: number;
} {
  const d = new Date(`${value}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  return { week: Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / 86400000 + 1) / 7), year };
}
export function weekOptions(count = 20, current = mondayOf()): {
  start: string;
  end: string;
  label: string;
}[] {
  return Array.from({ length: count }, (_, index) => { const start = addDays(current, (2 - index) * 7); return { start, end: addDays(start, 6), label: `Week ${isoWeek(start).week} · ${formatDate(start)}` }; });
}
