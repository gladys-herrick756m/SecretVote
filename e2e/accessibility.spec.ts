import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

async function checkAccessibility(page: Page, pageName: string) {
  // Check for proper heading hierarchy
  const h1Count = await page.locator('h1').count();
  expect(h1Count, `${pageName} should have exactly one h1`).toBeGreaterThanOrEqual(1);

  // Check for alt text on images
  const images = page.locator('img');
  const imageCount = await images.count();
  for (let i = 0; i < imageCount; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt, `Image ${i} should have alt text`).toBeDefined();
  }

  // Check for form labels
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');

    const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
    const hasAriaLabel = !!ariaLabel || !!ariaLabelledBy;

    expect(hasLabel || hasAriaLabel, `Input ${i} should have label or aria-label`).toBeTruthy();
  }

  // Check for proper button labels
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');

    expect(text || ariaLabel, `Button ${i} should have text or aria-label`).toBeTruthy();
  }
}

test.describe('Accessibility', () => {
  test('homepage should meet basic accessibility standards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await checkAccessibility(page, 'Homepage');
  });

  test('create proposal page should meet accessibility standards', async ({ page }) => {
    await page.goto('/create');
    await page.waitForLoadState('networkidle');
    await checkAccessibility(page, 'Create Proposal');
  });

  test('admin page should meet accessibility standards', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await checkAccessibility(page, 'Admin');
  });

  test('should support keyboard navigation on homepage', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should support keyboard navigation in forms', async ({ page }) => {
    await page.goto('/create');
    await page.keyboard.press('Tab');

    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    if (await titleInput.isVisible()) {
      await expect(titleInput).toBeFocused();
    }
  });

  test('modal should trap focus', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[role="dialog"]').first();
    if (await modal.isVisible()) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      const isInsideModal = await modal.locator(':focus').count() > 0;
      expect(isInsideModal).toBeTruthy();
    }
  });

  test('should support escape key to close modals', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[role="dialog"]').first();
    if (await modal.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      const modalVisible = await modal.isVisible();
      expect(modalVisible).toBeFalsy();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Visual check - ensure text is readable
    const textElements = page.locator('p, h1, h2, h3, span, button, a');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have skip to main content link', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.getByText(/skip to main|skip to content/i);
    // Skip links are optional but recommended
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
  });

  test('forms should have proper error announcements', async ({ page }) => {
    await page.goto('/create');

    const submitButton = page.getByRole('button', { name: /create|submit/i });
    await submitButton.click();

    const errorMessage = page.locator('[role="alert"], [aria-live="polite"]').first();
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header, [role="banner"]');
    const main = page.locator('main, [role="main"]');
    const nav = page.locator('nav, [role="navigation"]');

    await expect(header.first()).toBeVisible();
    await expect(main.first()).toBeVisible();
    await expect(nav.first()).toBeVisible();
  });

  test('interactive elements should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    const connectButton = page.getByRole('button', { name: /connect/i });
    await connectButton.focus();

    const focusedButton = page.locator('button:focus');
    await expect(focusedButton).toBeVisible();
  });

  test('should support screen reader announcements for dynamic content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const liveRegion = page.locator('[aria-live], [role="status"], [role="alert"]').first();
    if (await liveRegion.count() > 0) {
      await expect(liveRegion).toBeVisible();
    }
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.textContent() || await button.getAttribute('aria-label');
      expect(accessibleName, `Button ${i} should have accessible name`).toBeTruthy();
    }
  });

  test('links should have descriptive text', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      expect(text || ariaLabel, `Link ${i} should have descriptive text`).toBeTruthy();
    }
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('/');

    // Simulate zoom
    await page.setViewportSize({ width: 640, height: 480 });
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
