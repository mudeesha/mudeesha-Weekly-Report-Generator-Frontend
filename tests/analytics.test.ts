import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateAnalytics } from '../features/analytics/analytics';
import { reportFromApi, summaryFromApi, versionFromApi } from '../lib/api-adapters';
import { apiReport, apiTask, apiVersion } from './helpers';
import type { User, Project } from '../types';

const users: User[] = [{ id:'2', name:'Member', email:'member@example.test', role:'TEAM_MEMBER', isActive:true, projectIds:['1'] }, { id:'3', name:'New Member', email:'new@example.test', role:'TEAM_MEMBER', isActive:true, projectIds:['1'] }];
const projects: Project[] = [{ id:'1', name:'Platform', description:null, members:[] }, { id:'2', name:'Other', description:null, members:[] }];

test('latest visible content is counted once; old submissions never double-count hours', () => {
  const report = reportFromApi(apiReport());
  const first = versionFromApi(apiVersion({ id:19,version_number:1,submitted_at:'2026-09-13T10:00:00',tasks:[apiTask({ spent_hours:'20.00' })] }));
  const stats = aggregateAnalytics([report], [report], projects, users, [], {}, { '10':[first,report.currentVersion] });
  assert.equal(stats.totalHours,6); assert.equal(stats.submitted,1); assert.equal(stats.versionCount,2);
  assert.equal(stats.completedTasks,1); assert.equal(stats.onTime,1); assert.equal(stats.late,0);
});
test('private draft metadata is counted but not draft task contents in manager statistics', () => {
  const approved = reportFromApi(apiReport());
  const draft = apiReport({ id:11,status:'DRAFT',current_version:apiVersion({ submitted_at:null,tasks:[apiTask({spent_hours:'99.00'})] }) });
  const stats = aggregateAnalytics([approved,summaryFromApi(draft)],[approved],projects,users,[]);
  assert.equal(stats.totalReports,2); assert.equal(stats.drafts,1); assert.equal(stats.totalHours,6);
});
test('project filtering uses visible tasks and only sums the chosen project', () => {
  const report = reportFromApi(apiReport({ current_version:apiVersion({ tasks:[apiTask(),apiTask({id:8,project_id:2,spent_hours:'4.00'})] }) }));
  const stats = aggregateAnalytics([report],[report],projects,users,[],{projectId:'2'});
  assert.equal(stats.totalHours,4); assert.equal(stats.workloadByProject.length,1); assert.equal(stats.workloadByProject[0].project,'Other');
  assert.equal(aggregateAnalytics([report],[report],projects,users,[],{projectId:'999'}).totalReports,0);
});
test('current active-roster coverage includes not-started members, not fake expected totals', () => {
  const report = reportFromApi(apiReport());
  const stats = aggregateAnalytics([report],[report],projects,users,[]);
  assert.equal(stats.activeMembers,2); assert.equal(stats.reportingMembers,1); assert.equal(stats.coverage,50); assert.equal(stats.notStarted,1); assert.equal(stats.pending,1);
});
test('correction history and open blocker counts come from stored versions', () => {
  const report = reportFromApi(apiReport({current_version:apiVersion({blockers:[{id:1,title:'API access',description:null,status:'OPEN',is_key_issue:true},{id:2,title:'Credentials',description:null,status:'RESOLVED',is_key_issue:false}]})}));
  const first = versionFromApi(apiVersion({id:19,version_number:1,reviews:[{id:1,report_version_id:19,reviewer_id:4,action:'REQUEST_CHANGES',comment:'More details',created_at:'2026-09-14T11:00:00'}]}));
  const stats = aggregateAnalytics([report],[report],projects,users,[],{}, {'10':[first,report.currentVersion]});
  assert.equal(stats.openBlockers,1); assert.equal(stats.correctionCycles,1);
});
test('empty analytics return legitimate empty datasets and unknown roster coverage', () => {
  const stats = aggregateAnalytics([],[],[],[],[]);
  assert.equal(stats.totalHours,0); assert.equal(stats.totalReports,0); assert.equal(stats.coverage,null); assert.deepEqual(stats.submissionTrend,[]);
});
