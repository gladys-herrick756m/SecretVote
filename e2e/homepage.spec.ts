import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title and header', async ({ page }) => {
    await expect(page).toHaveTitle(/SecretVote/i);
    await expect(page.locator('header')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    await expect(page.getByRole('link', { name: /proposals?/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();
  });

  test('should display wallet connect button', async ({ page }) => {
    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();
  });

  test('should display proposal list container', async ({ page }) => {
    await expect(page.getByText(/all proposals/i)).toBeVisible();
  });

  test('should navigate to create proposal page', async ({ page }) => {
    await page.getByRole('link', { name: /create/i }).click();
    await expect(page).toHaveURL(/.*create/);
    await expect(page.getByText(/create.*proposal/i)).toBeVisible();
  });

  test('should navigate to admin page', async ({ page }) => {
    await page.getByRole('link', { name: /admin/i }).click();
    await expect(page).toHaveURL(/.*admin/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('header')).toBeVisible();
  });

  test('should handle page scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});
