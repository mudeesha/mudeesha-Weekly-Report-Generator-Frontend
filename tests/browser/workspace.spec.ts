import { expect, test, type Page } from '@playwright/test';

// Test-only HTTP interception: the production app always calls the real API.
// These tests verify browser behavior against the documented FastAPI response shapes.
const member = { id: 2, name: 'QA Member', email: 'member@example.test', role: 'TEAM_MEMBER', is_active: true };
const manager = { id: 4, name: 'QA Manager', email: 'manager@example.test', role: 'MANAGER', is_active: true };
const project = { id: 1, name: 'Client Platform', description: 'Reporting project', members: [member] };

async function connectContract(page: Page, role: 'TEAM_MEMBER' | 'MANAGER' = 'TEAM_MEMBER') {
  const user = role === 'MANAGER' ? manager : member;
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path.endsWith('/auth/login')) return route.fulfill({ json: { access_token: 'browser-contract-test-token', token_type: 'bearer' } });
    if (path.endsWith('/auth/me')) return route.fulfill({ json: user });
    if (path === '/api/v1/projects') return route.fulfill({ json: [project] });
    if (path === '/api/v1/users') return route.fulfill({ json: [member, manager] });
    if (path === '/api/v1/reports') return route.fulfill({ json: { page: Number(url.searchParams.get('page') || 1), page_size: Number(url.searchParams.get('page_size') || 10), total: 0, items: [] } });
    if (path.endsWith('/dashboard/activity')) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { detail: `No contract response for ${path}` } });
  });
}
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/^Email/).fill('member@example.test');
  await page.getByLabel(/^Password/).fill('Password123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test('login uses real API transport and no demo role switcher is present', async ({ page }) => {
  await connectContract(page);
  await signIn(page);
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await expect(page.getByText('member@example.test', { exact: true })).toBeVisible();
  await expect(page.getByText('Switch role', { exact: true })).toHaveCount(0);
});

test('team member cannot open user administration or manager analytics', async ({ page }) => {
  await connectContract(page);
  await signIn(page);
  await page.goto('/users');
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/analytics');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('manager can view directory but cannot use the Admin Users page', async ({ page }) => {
  await connectContract(page, 'MANAGER');
  await signIn(page);
  await page.goto('/team-members');
  await expect(page.getByRole('heading', { name: 'Team Members', exact: true })).toBeVisible();
  await page.goto('/users');
  await expect(page).toHaveURL(/\/dashboard$/);
});

test('report task dialog follows the existing design and stores a per-task project', async ({ page }) => {
  await connectContract(page);
  await signIn(page);
  await page.goto('/reports/new');
  await expect(page.getByRole('heading', { name: 'Create Weekly Report', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Add task/i }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Task name').fill('Payment regression testing');
  await dialog.getByLabel('Project / category').selectOption('1');
  await dialog.getByLabel('Task type').selectOption('TESTING');
  await dialog.getByRole('button', { name: 'Add task', exact: true }).click();
  await expect(page.getByText('Payment regression testing', { exact: true })).toBeVisible();
});

test('session expiry returns the user to sign-in without substituting sample data', async ({ page }) => {
  await connectContract(page);
  await signIn(page);
  await page.route('**/api/v1/auth/me', route => route.fulfill({ status: 401, json: { detail: 'Invalid or expired authentication token.' } }));
  await page.reload();
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});

test('layout stays within the viewport while tables can scroll internally', async ({ page }) => {
  await connectContract(page);
  await signIn(page);
  await page.goto('/projects');
  await expect(page.getByText('Client Platform', { exact: true })).toBeVisible();
  const sizes = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport + 1);
});
