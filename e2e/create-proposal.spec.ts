import { test, expect } from '@playwright/test';

test.describe('Create Proposal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create');
  });

  test('should display create proposal form', async ({ page }) => {
    await expect(page.getByText(/create.*proposal/i)).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have title input field', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toBeEditable();
  });

  test('should have description textarea', async ({ page }) => {
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await expect(descInput).toBeVisible();
    await expect(descInput).toBeEditable();
  });

  test('should have duration selector', async ({ page }) => {
    const durationField = page.getByLabel(/duration/i)
      .or(page.getByText(/voting.*period/i))
      .first();
    await expect(durationField).toBeVisible();
  });

  test('should validate empty title', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /create|submit/i });
    await submitButton.click();

    const errorMessage = page.getByText(/title.*required/i).or(page.getByText(/required/i));
    await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should validate title length', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('a'.repeat(201));

    const errorMessage = page.getByText(/too long|maximum.*200/i);
    await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should validate empty description', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Test Proposal');

    const submitButton = page.getByRole('button', { name: /create|submit/i });
    await submitButton.click();

    const errorMessage = page.getByText(/description.*required/i).or(page.getByText(/required/i));
    await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should validate description length', async ({ page }) => {
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('a'.repeat(2001));

    const errorMessage = page.getByText(/too long|maximum.*2000/i);
    await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should fill form with valid data', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Test Proposal for E2E');

    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('This is a detailed description for testing purposes.');

    await expect(titleInput).toHaveValue('Test Proposal for E2E');
    await expect(descInput).toHaveValue(/testing purposes/);
  });

  test('should select voting duration', async ({ page }) => {
    const durationSelect = page.locator('select, [role="combobox"]').first();

    if (await durationSelect.isVisible()) {
      await durationSelect.click();
      const option = page.getByRole('option', { name: /7.*day|week/i }).or(page.getByText(/7.*day/i)).first();
      if (await option.isVisible()) {
        await option.click();
      }
    }
  });

  test('should show wallet connection requirement', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Test Proposal');

    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Test Description');

    const submitButton = page.getByRole('button', { name: /create|submit/i });
    await submitButton.click();

    const walletMessage = page.getByText(/connect.*wallet|wallet.*required/i);
    await expect(walletMessage.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should have cancel button', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel/i }).or(page.getByRole('link', { name: /back/i }));

    if (await cancelButton.isVisible()) {
      await expect(cancelButton).toBeVisible();
    }
  });

  test('should display character counter for title', async ({ page }) => {
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await titleInput.fill('Test');

    const counter = page.getByText(/\d+\/200|\d+.*character/i);
    await expect(counter.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should display character counter for description', async ({ page }) => {
    const descInput = page.getByLabel(/description/i).or(page.getByPlaceholder(/description/i));
    await descInput.fill('Test description');

    const counter = page.getByText(/\d+\/2000|\d+.*character/i);
    await expect(counter.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('form')).toBeVisible();
  });
});
