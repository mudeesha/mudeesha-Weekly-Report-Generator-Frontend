import test from 'node:test';
import assert from 'node:assert/strict';
import { activityFromApi, draftToApi, hoursByType, projectFromApi, reportFromApi, taskFromApi, versionFromApi } from '../lib/api-adapters';
import { addDays, isoWeek, mondayOf, parseTimestamp } from '../lib/format';
import { csvCell } from '../lib/export';
import { taskErrors, validateDraft } from '../features/reports/validation';
import { apiReport, apiTask, apiVersion } from './helpers';
import type { ReportDraft } from '../types';

function draft(): ReportDraft {
  const report = reportFromApi(apiReport());
  return { weekStart: report.periodStart, notes: report.currentVersion.notes, tasks: report.currentVersion.tasks, blockers: [], achievements: [] };
}

test('backend decimal strings become numeric hours; null and zero remain distinct', () => {
  assert.equal(taskFromApi(apiTask()).spentHours, 6);
  assert.equal(taskFromApi(apiTask({ spent_hours: '0.00', planned_hours: null })).spentHours, 0);
  assert.equal(taskFromApi(apiTask({ planned_hours: null })).plannedHours, null);
  assert.throws(() => taskFromApi(apiTask({ spent_hours: 'invalid' })));
});
test('all project memberships are read from members, not a synthetic user list', () => {
  const project = projectFromApi({ id: 1, name: 'Platform', description: null, members: [{ id: 2, name: 'Member', email: 'member@example.test', role: 'TEAM_MEMBER' }] });
  assert.deepEqual(project.members[0], { userId: '2', name: 'Member', email: 'member@example.test', role: 'TEAM_MEMBER' });
});
test('report versions keep exact review attribution and real version number', () => {
  const version = versionFromApi(apiVersion({ reviews: [{ id: 8, report_version_id: 20, reviewer_id: 4, action: 'APPROVE', comment: null, created_at: '2026-09-15T11:00:00' }] }));
  assert.equal(version.id, '20'); assert.equal(version.versionNumber, 2); assert.equal(version.reviews[0].reportVersionId, '20');
});
test('draft payload maps project/task fields and excludes server-owned IDs and states', () => {
  const value = draft();
  value.tasks.push(taskFromApi(apiTask({ id: 11, project_id: 2, section: 'NEXT_WEEK', spent_hours: null })));
  const payload = draftToApi(value);
  assert.equal(payload.week_start, '2026-09-07');
  assert.equal(payload.tasks[0].spent_hours, 6); assert.equal(payload.tasks[1].project_id, 2);
  for (const key of ['id', 'user_id', 'status', 'version_number', 'due_at']) assert.equal(key in payload, false);
  assert.equal('id' in payload.tasks[0], false); assert.equal('report_version_id' in payload.tasks[0], false);
});
test('hours summarize THIS_WEEK task types only, including unfinished work', () => {
  const hours = hoursByType([taskFromApi(apiTask({ spent_hours: '4.25', status: 'IN_PROGRESS' })), taskFromApi(apiTask({ task_type: 'MEETINGS', spent_hours: '1.5' })), taskFromApi(apiTask({ section: 'NEXT_WEEK', spent_hours: '90.00' }))]);
  assert.equal(hours.find(h => h.type === 'Testing')?.hours, 4.25);
  assert.equal(hours.find(h => h.type === 'Meetings')?.hours, 1.5);
});
test('draft allows incomplete work; submission requires current-week progress fields', () => {
  const value = draft(); value.tasks[0].spentHours = null;
  assert.equal(validateDraft(value, false), null);
  assert.match(validateDraft(value, true) || '', /Complete priority/);
  value.tasks[0].spentHours = 0; assert.equal(validateDraft(value, true), null);
});
test('next-week only content cannot be submitted as current-week work', () => {
  const value = draft(); value.tasks[0].section = 'NEXT_WEEK';
  assert.match(validateDraft(value, true) || '', /at least one current-week/);
});
test('week must be a valid Monday', () => {
  for (const date of ['2026-09-08', '', 'invalid', '2026-02-30']) { const value = draft(); value.weekStart = date; assert.match(validateDraft(value, false) || '', /Monday/); }
  assert.equal(validateDraft(draft(), false), null);
});
test('decimal precision, percent ranges, and whitespace titles are validated', () => {
  assert.ok(taskErrors({ ...draft().tasks[0], name: '   ' }).name);
  assert.ok(taskErrors({ ...draft().tasks[0], actualPercent: 101 }).actualPercent);
  assert.ok(taskErrors({ ...draft().tasks[0], spentHours: 1.234 }).spentHours);
  assert.ok(taskErrors({ ...draft().tasks[0], plannedHours: -1 }).plannedHours);
});
test('only one key blocker and achievement are allowed', () => {
  const value = draft();
  value.blockers = [1, 2].map(id => ({ id: String(id), title: 'Blocked', description: null, status: 'OPEN', isKeyIssue: true }));
  assert.match(validateDraft(value, false) || '', /Only one blocker/);
  value.blockers = []; value.achievements = [1, 2].map(id => ({ id: String(id), title: 'Achieved', description: null, isKeyAchievement: true }));
  assert.match(validateDraft(value, false) || '', /Only one achievement/);
});
test('ISO week calculations and Sri Lanka naive timestamps cross boundaries correctly', () => {
  assert.deepEqual(isoWeek('2026-09-07'), { week: 37, year: 2026 });
  assert.deepEqual(isoWeek('2021-01-01'), { week: 53, year: 2020 });
  assert.equal(mondayOf('2026-09-13'), '2026-09-07'); assert.equal(addDays('2026-09-07', 7), '2026-09-14');
  assert.equal(parseTimestamp('2026-09-14T09:00:00').toISOString(), '2026-09-14T03:30:00.000Z');
  assert.equal(parseTimestamp('2026-09-14T03:30:00Z').toISOString(), '2026-09-14T03:30:00.000Z');
});
test('CSV escapes quotes and prefixes formula cells', () => {
  assert.equal(csvCell('A "name"'), '"A ""name"""'); assert.equal(csvCell('=1+1'), '"\'=1+1"'); assert.equal(csvCell('Safe'), '"Safe"');
});
test('activity uses real event content and exact report version', () => {
  const result = activityFromApi({ activity_type: 'REPORT_APPROVED', message: 'Review completed', report_id: 10, version_number: 2, user_id: 2, user_name: 'Member', reviewer_id: 4, reviewer_name: 'Manager', week_start: '2026-09-07', created_at: '2026-09-15T11:00:00' });
  assert.equal(result.message, 'Review completed'); assert.equal(result.versionNumber, 2); assert.equal(result.reviewerId, '4');
});
