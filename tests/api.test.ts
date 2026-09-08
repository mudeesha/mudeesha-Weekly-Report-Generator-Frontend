import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { installBrowserGlobals, jsonResponse, apiReport, apiVersion } from './helpers';
import { ApiError, AUTH_EXPIRED_EVENT, getToken, numericId, queryString, request, setToken } from '../lib/api-client';
import * as auth from '../services/auth.service';
import * as users from '../services/user.service';
import * as projects from '../services/project.service';
import * as reports from '../services/report.service';
import * as ai from '../services/ai.service';
import { getActivities } from '../services/dashboard.service';
import { getAnalyticsData } from '../services/analytics.service';
import { reportFromApi } from '../lib/api-adapters';

const originalFetch = globalThis.fetch;
const target = installBrowserGlobals();
let calls: { url: string; init: RequestInit }[] = [];
let respond: (url: string, init: RequestInit) => Response | Promise<Response>;
beforeEach(() => {
  calls = []; setToken(null);
  respond = () => jsonResponse({});
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return respond(String(url), init); };
});
after(() => { setToken(null); globalThis.fetch = originalFetch; });

const currentUser = {id:2,name:'Member',email:'member@example.test',role:'TEAM_MEMBER',is_active:true};

test('login uses form username=email and preserves password special characters', async () => {
  respond = url => url.endsWith('/auth/login') ? jsonResponse({access_token:'test-access-token',token_type:'bearer'}) : jsonResponse(currentUser);
  const user = await auth.login(' Member@EXAMPLE.test ', 'Some+password&value=2');
  assert.equal(user.id,'2'); assert.equal(calls.length,2);
  assert.equal(new Headers(calls[0].init.headers).get('Content-Type'),'application/x-www-form-urlencoded');
  const body = new URLSearchParams(String(calls[0].init.body));
  assert.equal(body.get('username'),'member@example.test'); assert.equal(body.get('password'),'Some+password&value=2');
  assert.equal(new Headers(calls[1].init.headers).get('Authorization'),'Bearer test-access-token');
});
test('public registration sends only name email and password, no role or bearer header', async () => {
  setToken('existing-admin-token'); respond = () => jsonResponse(currentUser,201);
  await auth.register(' Member ','Member@EXAMPLE.test','Password123');
  assert.deepEqual(JSON.parse(String(calls[0].init.body)),{name:'Member',email:'member@example.test',password:'Password123'});
  assert.equal(new Headers(calls[0].init.headers).has('Authorization'),false);
});
test('401 clears current credentials and announces session expiry', async () => {
  let expired = false;
  target.addEventListener(AUTH_EXPIRED_EVENT,()=>{expired=true;},{once:true});
  setToken('expired-token'); respond = () => jsonResponse({detail:'Invalid or expired authentication token.'},401);
  await assert.rejects(auth.me(),error=>error instanceof ApiError && error.status===401);
  assert.equal(getToken(),null); assert.equal(expired,true);
});
test('inactive-user 403 logs out, but ordinary permission 403 retains login', async () => {
  setToken('member-token'); respond = () => jsonResponse({detail:'You do not have permission to perform this action.'},403);
  await assert.rejects(users.getUsers()); assert.equal(getToken(),'member-token');
  respond = () => jsonResponse({detail:'This account is inactive.'},403);
  await assert.rejects(auth.me()); assert.equal(getToken(),null);
});
test('a stale 401 does not clear a newer access token', async () => {
  setToken('old-token'); respond = () => {setToken('new-token');return jsonResponse({detail:'Expired'},401);};
  await assert.rejects(auth.me()); assert.equal(getToken(),'new-token');
});
test('422 Pydantic validation messages are mapped to readable field errors', async () => {
  respond = () => jsonResponse({detail:[{loc:['body','tasks',0,'planned_percent'],msg:'Input should be less than or equal to 100'}]},422);
  await assert.rejects(request('/reports'),e=>e instanceof ApiError && e.message.includes('tasks.0.planned_percent'));
});
test('network errors are real errors, never replaced by mock data', async () => {
  respond = () => {throw new TypeError('Network unavailable');};
  await assert.rejects(projects.getProjects(),e=>e instanceof ApiError && e.status===0 && e.message.includes('Cannot reach the backend'));
});
test('non-JSON server error does not expose a traceback in the UI', async () => {
  respond = () => new Response('Traceback: SECRET_INTERNAL_DETAIL', {status:500});
  await assert.rejects(auth.me(),e=>e instanceof ApiError && e.status===500 && !e.message.includes('SECRET'));
});
test('HTML success responses explain incorrect API proxy configuration', async () => {
  respond = () => new Response('<html>Frontend fallback</html>',{status:200});
  await assert.rejects(auth.me(),e=>e instanceof ApiError && e.message.includes('did not return JSON'));
});
test('deleted unused project handles 204 without parsing a response body', async () => {
  respond = () => new Response(null,{status:204});
  assert.equal(await projects.deleteProject('2'),undefined); assert.equal(calls[0].init.method,'DELETE');
});
test('project membership PUT replaces only a deduplicated numeric user list', async () => {
  respond = () => jsonResponse({id:1,name:'Platform',description:null,members:[]});
  await projects.assignProjectMembers('1',['2','2','4']);
  assert.equal(calls[0].init.method,'PUT'); assert.deepEqual(JSON.parse(String(calls[0].init.body)),{user_ids:[2,4]});
});
test('project description can be cleared with null', async () => {
  respond = () => jsonResponse({id:1,name:'Platform',description:null,members:[]});
  await projects.updateProject('1',{name:'Platform',description:null});
  assert.equal(JSON.parse(String(calls[0].init.body)).description,null);
});
test('report filters and server pagination are sent under backend field names', async () => {
  respond = () => jsonResponse({page:2,page_size:10,total:1,items:[apiReport()]});
  const response = await reports.getReports({userId:'2',projectId:'1',status:'APPROVED',from:'2026-09-01',to:'2026-09-30'},2,10);
  const query = new URL(calls[0].url,'http://test').searchParams;
  assert.equal(query.get('page'),'2'); assert.equal(query.get('user_id'),'2'); assert.equal(query.get('project_id'),'1');
  assert.equal(query.get('status'),'APPROVED'); assert.equal(query.get('week_start_from'),'2026-09-01');
  assert.equal(response.items[0].id,'10'); assert.equal(response.total,1);
});
test('report updates never send week owner workflow status or task IDs', async () => {
  const report = reportFromApi(apiReport()); respond = () => jsonResponse(apiReport());
  await reports.updateReport('10',{weekStart:report.periodStart,...report.currentVersion});
  const body = JSON.parse(String(calls[0].init.body));
  assert.equal(calls[0].init.method,'PATCH'); assert.equal('week_start' in body,false); assert.equal('status' in body,false); assert.equal('id' in body.tasks[0],false);
});
test('submit approve and request-changes use separate action endpoints', async () => {
  respond = () => jsonResponse(apiReport());
  await reports.submitReport('10'); await reports.approveReport('10'); await reports.requestChanges('10','  Add test output  ');
  assert.deepEqual(calls.map(c=>c.url),['/api/v1/reports/10/submit','/api/v1/reports/10/approve','/api/v1/reports/10/request-changes']);
  assert.deepEqual(JSON.parse(String(calls[2].init.body)),{comment:'Add test output'});
});
test('version-specific URL uses version NUMBER and preserves stored ID separately', async () => {
  respond = () => jsonResponse(apiVersion({id:20,version_number:2}));
  const version = await reports.getVersion('10',2);
  assert.equal(calls[0].url,'/api/v1/reports/10/versions/2'); assert.equal(version.id,'20');
});
test('all-metadata loader fetches later pages and rejects unexpected partial pages', async () => {
  let page=0;
  respond = () => jsonResponse(++page===1 ? {page:1,page_size:100,total:2,items:[apiReport()]} : {page:2,page_size:100,total:2,items:[apiReport({id:11})]});
  assert.equal((await reports.getAllReportSummaries()).length,2); assert.equal(calls.length,2);
  page=0; respond = () => jsonResponse(++page===1 ? {page:1,page_size:100,total:2,items:[apiReport()]} : {page:2,page_size:100,total:2,items:[]});
  await assert.rejects(reports.getAllReportSummaries(),e=>e instanceof ApiError && e.status===409);
});
test('manager analytics never request private draft detail or unpublished hour aggregates', async () => {
  respond = url => {
    if (url.startsWith('/api/v1/reports?')) return jsonResponse({page:1,page_size:100,total:2,items:[apiReport(),apiReport({id:11,status:'DRAFT'})]});
    if (url==='/api/v1/reports/10') return jsonResponse(apiReport());
    if (url==='/api/v1/reports/10/versions') return jsonResponse([apiVersion()]);
    if (url.startsWith('/api/v1/dashboard/activity')) return jsonResponse([]);
    throw new Error(`Unexpected request: ${url}`);
  };
  const result = await getAnalyticsData({projectId:'1'},[],[],true);
  assert.equal(result.totalHours,6); assert.equal(result.drafts,0);
  assert.equal(calls.some(c=>c.url==='/api/v1/reports/11'),false);
  assert.equal(calls.some(c=>c.url.includes('/dashboard/summary') || c.url.includes('/hours-by-project')),false);
  const reportList = calls.find(c=>c.url.startsWith('/api/v1/reports?'))!;
  assert.equal(new URL(reportList.url,'http://test').searchParams.has('project_id'),false);
});
test('activity filters use owner, project, reporting dates and bounded limit', async () => {
  respond=()=>jsonResponse([]);
  await getActivities(10,{userId:'2',projectId:'1',from:'2026-09-07'});
  const query=new URL(calls[0].url,'http://test').searchParams;
  assert.equal(query.get('user_id'),'2');assert.equal(query.get('project_id'),'1');assert.equal(query.get('limit'),'10');
});
test('invalid record IDs fail before making a request', async () => {
  for (const id of ['0','-1','no-id','']) assert.throws(()=>numericId(id));
  assert.equal(numericId('25'),25); assert.equal(calls.length,0);
});
test('query builder omits absent and ALL filters and URL-encodes values',()=>{
  assert.equal(queryString({status:'ALL',user_id:undefined,limit:10}),'?limit=10');
  assert.equal(new URLSearchParams(queryString({q:'a&b'}).slice(1)).get('q'),'a&b');
});

test('notes-only editor changes do not replace unchanged tasks or touch their IDs', async () => {
  const report = reportFromApi(apiReport());
  const original = {weekStart:report.periodStart, ...report.currentVersion};
  respond = () => jsonResponse(apiReport());
  await reports.updateReport('10',{...original,notes:null},original);
  assert.deepEqual(JSON.parse(String(calls[0].init.body)),{notes:null});
});

test('AI chat sends only the manager question and bounded conversation history to the real backend endpoint', async () => {
  setToken('manager-token');
  respond = () => jsonResponse({answer:'Grounded summary',reports_used:2,period_start:'2026-06-15',period_end:'2026-09-07'});
  const history = Array.from({length:10},(_,index)=>({role:index%2===0?'user':'assistant',content:` Message ${index} `} as const));
  const result = await ai.chat('  Summarize the team  ', history);
  assert.equal(calls[0].url,'/api/v1/ai/chat');
  assert.equal(new Headers(calls[0].init.headers).get('Authorization'),'Bearer manager-token');
  const body = JSON.parse(String(calls[0].init.body));
  assert.equal(body.message,'Summarize the team');
  assert.equal(body.history.length,8);
  assert.deepEqual(body.history[0],{role:'user',content:'Message 2'});
  assert.equal(result.answer,'Grounded summary');
  assert.equal(result.reports_used,2);
});

test('Admin Add User posts directly to users with role and keeps the admin token', async () => {
  setToken('admin-token');
  respond = () => jsonResponse({ ...currentUser, id: 5, name: 'Lasith Malinga', email: 'lasith@example.test' }, 201);
  const result = await users.createUser(' Lasith Malinga ', ' Lasith@EXAMPLE.test ', 'Password+123&', 'TEAM_MEMBER');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/v1/users');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(new Headers(calls[0].init.headers).get('Authorization'), 'Bearer admin-token');
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { name: 'Lasith Malinga', email: 'lasith@example.test', password: 'Password+123&', role: 'TEAM_MEMBER' });
  assert.equal(result.id, '5');
  assert.equal(getToken(), 'admin-token');
});

test('notes clearing still sends null and never replaces unrelated task arrays', async () => {
  const report = reportFromApi(apiReport());
  const initial = { weekStart: report.periodStart, ...report.currentVersion };
  respond = () => jsonResponse(apiReport());
  await reports.updateReport('10', { ...initial, notes: null }, initial);
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { notes: null });
});
