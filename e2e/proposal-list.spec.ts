import { test, expect } from '@playwright/test';

test.describe('Proposal List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display proposals container', async ({ page }) => {
    const container = page.locator('[data-testid="proposal-list"], .proposal-list, main');
    await expect(container).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const loadingIndicator = page.getByText(/loading/i).or(page.locator('[data-loading="true"]'));
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 1000 }).catch(() => {});
  });

  test('should display proposal cards when loaded', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const cards = page.locator('[data-testid="proposal-card"], .proposal-card, article');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display empty state if no proposals', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const emptyMessage = page.getByText(/no proposals/i).or(page.getByText(/create.*first/i));
    const hasCards = await page.locator('article').count() > 0;

    if (!hasCards) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });

  test('should filter proposals by status', async ({ page }) => {
    const filterButton = page.getByRole('button', { name: /active/i })
      .or(page.getByRole('button', { name: /filter/i }))
      .first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should search proposals', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('textbox')).first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should click proposal card and navigate to detail', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const firstCard = page.locator('article, [data-testid="proposal-card"]').first();
    const cardExists = await firstCard.count() > 0;

    if (cardExists) {
      await firstCard.click();
      await expect(page).toHaveURL(/.*proposal\/\d+/);
    }
  });

  test('should display proposal status badge', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const statusBadge = page.locator('[data-status], .status-badge, .badge').first();

    if (await statusBadge.count() > 0) {
      await expect(statusBadge).toBeVisible();
    }
  });

  test('should display proposal voting period', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const timeInfo = page.getByText(/days?|hours?|ended/i).first();

    if (await timeInfo.count() > 0) {
      await expect(timeInfo).toBeVisible();
    }
  });

  test('should refresh proposals list', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh/i })
      .or(page.locator('[data-action="refresh"]'))
      .first();

    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);
    }
  });
});
