import test from 'node:test';
import assert from 'node:assert/strict';
import { saveAchievement, saveBlocker, reportEntryError } from '../features/reports/editor-items';
import { filterTableRows, lastPageIndex, visibleRange } from '../components/ui/data-table/table-utils';
import { draftToApi } from '../lib/api-adapters';
import type { ReportAchievement, ReportBlocker, ReportDraft } from '../types';

const blocker: ReportBlocker = { id: '1', title: 'Environment unavailable', description: 'Waiting for staging.', status: 'OPEN', isKeyIssue: true };
const achievement: ReportAchievement = { id: '1', title: 'Payment tests completed', description: 'All scenarios checked.', isKeyAchievement: true };

test('editing a blocker preserves its existing ID and leaves original version untouched', () => {
  const original = [blocker];
  const next = saveBlocker(original, { ...blocker, status: 'RESOLVED' });
  assert.equal(next.length, 1); assert.equal(next[0].id, '1'); assert.equal(next[0].status, 'RESOLVED');
  assert.equal(original[0].status, 'OPEN');
});
test('adding a second key blocker unsets only the previous key, not its content', () => {
  const next = saveBlocker([blocker], { ...blocker, id: 'new', title: 'Review dependency', isKeyIssue: true });
  assert.equal(next.length, 2); assert.equal(next[0].isKeyIssue, false); assert.equal(next[1].isKeyIssue, true);
  assert.equal(next[0].description, blocker.description); assert.equal(blocker.isKeyIssue, true);
});
test('ordinary blockers do not clear an existing key issue', () => {
  const next = saveBlocker([blocker], { ...blocker, id: 'new', isKeyIssue: false });
  assert.equal(next[0].isKeyIssue, true); assert.equal(next[1].isKeyIssue, false);
});
test('editing an achievement retains its identity and enforces a single key', () => {
  const next = saveAchievement([achievement, { ...achievement, id: '2', isKeyAchievement: false }], { ...achievement, id: '2', title: 'Review completed' });
  assert.deepEqual(next.map(item => item.id), ['1', '2']); assert.equal(next.filter(item => item.isKeyAchievement).length, 1);
  assert.equal(next[0].isKeyAchievement, false); assert.equal(next[1].title, 'Review completed');
});
test('unchecking the current key does not silently promote another item', () => {
  assert.equal(saveAchievement([achievement], { ...achievement, isKeyAchievement: false }).filter(item => item.isKeyAchievement).length, 0);
});
test('modal title and description limits match existing report constraints', () => {
  assert.ok(reportEntryError('   ', ''));
  assert.ok(reportEntryError('x', ''));
  assert.ok(reportEntryError('x'.repeat(256), ''));
  assert.ok(reportEntryError('Valid title', 'x'.repeat(10001)));
  assert.equal(reportEntryError(' Valid title ', 'x'.repeat(10000)), null);
});
test('new modal entry IDs are UI-only and API field names remain unchanged', () => {
  const draft: ReportDraft = { weekStart: '2026-09-07', notes: 'A note\nhttps://example.test', tasks: [], blockers: [blocker], achievements: [achievement] };
  const payload = draftToApi(draft);
  assert.equal(payload.notes, draft.notes);
  assert.equal('id' in payload.blockers[0], false);
  assert.equal(payload.blockers[0].is_key_issue, true);
  assert.equal(payload.achievements[0].is_key_achievement, true);
});
test('notes remain a single string, not a new collection or encoded structure', () => {
  const draft: ReportDraft = { weekStart: '2026-09-07', notes: 'First point\n\nSecond point', tasks: [], blockers: [], achievements: [] };
  assert.equal(draftToApi(draft).notes, 'First point\n\nSecond point');
  assert.equal(draftToApi({ ...draft, notes: null }).notes, null);
});
test('shared table search is case-insensitive and trims the search phrase', () => {
  const rows = [{ name: 'John Doe' }, { name: 'Lasith Malinga' }];
  assert.deepEqual(filterTableRows(rows, ' LASITH ', row => row.name), [rows[1]]);
  assert.equal(filterTableRows(rows, '', row => row.name), rows);
  assert.deepEqual(filterTableRows(rows, 'no match', row => row.name), []);
});
test('pagination handles empty, exact-page and partially-filled datasets', () => {
  assert.equal(lastPageIndex(0, 10), 0); assert.equal(lastPageIndex(10, 10), 0); assert.equal(lastPageIndex(11, 10), 1);
  assert.deepEqual(visibleRange(0, 0, 10), [0, 0]); assert.deepEqual(visibleRange(11, 1, 10), [11, 11]);
});
