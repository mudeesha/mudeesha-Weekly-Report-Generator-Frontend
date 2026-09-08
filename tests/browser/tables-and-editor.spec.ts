import { expect, test, type Page } from '@playwright/test';

// Test-only API fixtures. No fixture is imported by application code.
async function connect(page: Page, role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN' = 'TEAM_MEMBER') {
  const member = { id: 2, name: 'John Doe', email: 'john@example.test', role: 'TEAM_MEMBER', is_active: true };
  const me = role === 'TEAM_MEMBER' ? member : { id: role === 'ADMIN' ? 1 : 4, name: 'Test Reviewer', email: 'reviewer@example.test', role, is_active: true };
  const users = [me, ...(role === 'TEAM_MEMBER' ? [] : [member])];
  const projects = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Test Project ${String(i + 1).padStart(2, '0')}`, description: 'Project details', members: [member] }));
  let report = {
    id: 1, user_id: 2, week_start: '2026-09-07', week_end: '2026-09-13', due_at: '2026-09-14T09:00:00',
    status: role === 'TEAM_MEMBER' ? 'DRAFT' : 'APPROVED', created_at: '2026-09-08T10:00:00', updated_at: '2026-09-08T10:00:00', latest_review: null,
    current_version: {
      id: 1, version_number: 1, notes: 'Original notes', submitted_at: role === 'TEAM_MEMBER' ? null : '2026-09-08T10:00:00', reviews: [],
      tasks: [{ id: 1, project_id: 1, section: 'THIS_WEEK', task_type: 'TESTING', name: 'Payment testing', priority: 'HIGH', planned_percent: 100, actual_percent: 100, status: 'COMPLETED', planned_hours: '8.00', spent_hours: '6.00', output: 'Testing completed' }],
      blockers: [{ id: 1, title: 'Original blocker', description: 'Staging is unavailable.', status: 'OPEN', is_key_issue: true }],
      achievements: [{ id: 1, title: 'Regression complete', description: 'All scenarios checked.', is_key_achievement: true }],
    },
  };
  const changes: Record<string, unknown>[] = [];
  let created: Record<string, unknown> | null = null;
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith('/auth/login')) return route.fulfill({ json: { access_token: 'test-token', token_type: 'bearer' } });
    if (path.endsWith('/auth/me')) return route.fulfill({ json: me });
    if (path === '/api/v1/projects') return route.fulfill({ json: projects });
    if (path === '/api/v1/users' && request.method() === 'POST') {
      created = request.postDataJSON();
      const user = { id: 15, name: String(created!.name), email: String(created!.email), role: String(created!.role), is_active: true };
      users.push(user);
      return route.fulfill({ status: 201, json: user });
    }
    if (path === '/api/v1/users') return route.fulfill({ json: users });
    if (path === '/api/v1/reports') {
      const pageIndex = Number(url.searchParams.get('page') || 1);
      const pageSize = Number(url.searchParams.get('page_size') || 10);
      const all = Array.from({ length: 13 }, (_, i) => ({ ...report, id: i + 1 }));
      return route.fulfill({ json: { page: pageIndex, page_size: pageSize, total: all.length, items: all.slice((pageIndex - 1) * pageSize, pageIndex * pageSize) } });
    }
    if (path === '/api/v1/reports/1' && request.method() === 'PATCH') {
      const body = request.postDataJSON(); changes.push(body);
      report = { ...report, updated_at: new Date().toISOString(), current_version: { ...report.current_version, ...body } };
      return route.fulfill({ json: report });
    }
    if (path === '/api/v1/reports/1') return route.fulfill({ json: report });
    if (path === '/api/v1/reports/1/versions') return route.fulfill({ json: [report.current_version] });
    if (path.endsWith('/dashboard/activity')) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { detail: 'Not in the browser test contract.' } });
  });
  await page.goto('/login');
  await page.getByLabel(/^Email/).fill(me.email);
  await page.getByLabel(/^Password/).fill('Password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  return { changes, created: () => created };
}

test('projects reuse the searchable and paginated data table', async ({ page }) => {
  await connect(page);
  await page.goto('/projects');
  const table = page.getByRole('region', { name: 'Projects', exact: true });
  await expect(table.locator('tbody tr')).toHaveCount(10);
  await table.getByRole('button', { name: 'Next page of projects', exact: true }).click();
  await expect(table.locator('tbody tr')).toHaveCount(2);
  await table.getByLabel('Search projects', { exact: true }).fill('Test Project 03');
  await expect(table.locator('tbody tr')).toHaveCount(1);
  await expect(table.getByText('Test Project 03', { exact: true })).toBeVisible();
  await expect(table.getByText('Page 1 of 1', { exact: true })).toBeVisible();
});

test('report pagination remains server-side and sends the selected page size', async ({ page }) => {
  await connect(page);
  await page.goto('/reports');
  const table = page.getByRole('region', { name: 'Reports', exact: true });
  await expect(table.locator('tbody tr')).toHaveCount(10);
  const request = page.waitForRequest(request => /\/reports\?/.test(request.url()) && new URL(request.url()).searchParams.get('page') === '2');
  await table.getByRole('button', { name: 'Next page of reports', exact: true }).click();
  await request;
  await expect(table.locator('tbody tr')).toHaveCount(3);
  await expect(table.getByText('11–13 of 13', { exact: true })).toBeVisible();
});

test('blockers use add/view/edit/delete modals and preserve single-key behavior', async ({ page }) => {
  const { changes } = await connect(page);
  await page.goto('/reports/1/edit');
  const table = page.getByRole('region', { name: 'Blockers', exact: true });
  await table.getByRole('button', { name: 'Add blocker', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByLabel('Title', { exact: false }).fill('Second blocker');
  await dialog.getByLabel('Supporting details', { exact: true }).fill('Waiting for a review.');
  await dialog.getByLabel('Key issue', { exact: true }).check();
  await dialog.getByRole('button', { name: 'Add blocker', exact: true }).click();
  await expect(table.locator('tbody tr')).toHaveCount(2);
  await expect(table.locator('tbody').getByText('Key issue', { exact: true })).toHaveCount(1);
  await table.getByRole('button', { name: 'View Second blocker', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Waiting for a review.', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await table.getByRole('button', { name: 'Edit Second blocker', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Title', { exact: false }).fill('Cancelled change');
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(table.getByText('Second blocker', { exact: true })).toBeVisible();
  await expect(table.getByText('Cancelled change', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect.poll(() => changes.length).toBe(1);
  const blockers = changes[0].blockers as { title: string; is_key_issue: boolean }[];
  expect(blockers).toHaveLength(2);
  expect(blockers[0].is_key_issue).toBe(false);
  expect(blockers[1].is_key_issue).toBe(true);
  expect(changes[0]).not.toHaveProperty('tasks');
});

test('notes edits and deletion retain the original backend string/null contract', async ({ page }) => {
  const { changes } = await connect(page);
  await page.goto('/reports/1/edit');
  const notes = page.getByRole('region', { name: 'Notes', exact: true });
  await notes.getByRole('button', { name: 'Edit notes', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Notes and links', { exact: false }).fill('First line\nSecond line');
  await page.getByRole('dialog').getByRole('button', { name: 'Save notes', exact: true }).click();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect.poll(() => changes.length).toBe(1);
  expect(changes[0]).toEqual({ notes: 'First line\nSecond line' });
  await expect(page.getByRole('button', { name: 'Save draft', exact: true })).toBeEnabled();
  await notes.getByRole('button', { name: 'Delete notes', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete notes', exact: true }).click();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect.poll(() => changes.length).toBe(2);
  expect(changes[1]).toEqual({ notes: null });
});

test('management report tables are read-only but retain detail viewing', async ({ page }) => {
  await connect(page, 'MANAGER');
  await page.goto('/reports/1');
  const table = page.getByRole('region', { name: 'Blockers', exact: true }).first();
  await expect(table.getByRole('button', { name: 'View Original blocker', exact: true })).toBeVisible();
  await expect(table.getByRole('button', { name: /^Edit |^Delete |^Add blocker$/ })).toHaveCount(0);
  await table.getByRole('button', { name: 'View Original blocker', exact: true }).click();
  await expect(page.getByRole('dialog').getByText('Staging is unavailable.', { exact: true })).toBeVisible();
});

test('direct Add User remains available to Admin', async ({ page }) => {
  const result = await connect(page, 'ADMIN');
  await page.goto('/users');
  await page.getByRole('button', { name: 'Add User', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: false }).fill('New Member');
  await dialog.getByLabel('Email', { exact: false }).fill('new@example.test');
  await dialog.getByLabel('Password', { exact: false }).fill('Password123');
  await dialog.getByRole('button', { name: 'Create user', exact: true }).click();
  await expect.poll(result.created).not.toBeNull();
  expect(result.created()).toEqual({ name: 'New Member', email: 'new@example.test', password: 'Password123', role: 'TEAM_MEMBER' });
  await expect(page.getByText('new@example.test', { exact: true })).toBeVisible();
});

test('sidebar stays fixed while content scrolls and switches exactly below 990px', async ({ page }) => {
  await connect(page);
  await page.goto('/reports/1/edit');
  await page.setViewportSize({ width: 1440, height: 800 });
  const sidebar = page.locator('#workspace-sidebar');
  await expect(sidebar).toBeVisible();
  const top = (await sidebar.boundingBox())!.y;
  await page.locator('.wr-main').evaluate(node => { node.scrollTop = 600; });
  expect((await sidebar.boundingBox())!.y).toBe(top);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  for (const width of [989, 990, 1023, 1024]) {
    await page.setViewportSize({ width, height: 800 });
    if (width < 990) { await expect(sidebar).toBeHidden(); await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toBeVisible(); }
    else { await expect(sidebar).toBeVisible(); await expect(page.getByRole('button', { name: 'Toggle sidebar' })).toBeHidden(); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 768, height: 800 });
  await page.getByRole('button', { name: 'Toggle sidebar' }).click();
  await expect(sidebar).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sidebar).toBeHidden();
});
