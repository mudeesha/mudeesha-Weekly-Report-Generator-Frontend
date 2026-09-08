import type { ApiReport, ApiTask, ApiVersion } from '../lib/api-contracts';

// Contract examples for isolated tests ONLY. Never imported by the application.
export function apiTask(overrides: Partial<ApiTask> = {}): ApiTask {
  return { id: 7, project_id: 1, section: 'THIS_WEEK', task_type: 'TESTING', name: 'Payment testing', priority: 'HIGH', planned_percent: 100, actual_percent: 100, status: 'COMPLETED', planned_hours: '6.00', spent_hours: '6.00', output: 'Test results', ...overrides };
}
export function apiVersion(overrides: Partial<ApiVersion> = {}): ApiVersion {
  return { id: 20, version_number: 2, notes: 'Corrected notes', submitted_at: '2026-09-15T10:00:00', tasks: [apiTask()], blockers: [], achievements: [], reviews: [], ...overrides };
}
export function apiReport(overrides: Partial<ApiReport> = {}): ApiReport {
  return { id: 10, user_id: 2, week_start: '2026-09-07', week_end: '2026-09-13', due_at: '2026-09-14T09:00:00', status: 'APPROVED', created_at: '2026-09-07T09:00:00', updated_at: '2026-09-15T11:00:00', current_version: apiVersion(), latest_review: null, ...overrides };
}
export function installBrowserGlobals() {
  const memory = new Map<string, string>();
  const target = new EventTarget();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value), removeItem: (key: string) => memory.delete(key), clear: () => memory.clear() } });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout, dispatchEvent: target.dispatchEvent.bind(target), addEventListener: target.addEventListener.bind(target), removeEventListener: target.removeEventListener.bind(target) } });
  return target;
}
export function jsonResponse(value: unknown, status = 200): Response { return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } }); }
