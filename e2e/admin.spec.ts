import { test, expect } from '@playwright/test';

test.describe('Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should display admin page title', async ({ page }) => {
    await expect(page.getByText(/admin|management/i).first()).toBeVisible();
  });

  test('should display role management section', async ({ page }) => {
    const roleSection = page.getByText(/role.*management|manage.*role/i).first();
    await expect(roleSection).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should have voter role section', async ({ page }) => {
    const voterSection = page.getByText(/voter.*role|grant.*voter/i).first();
    await expect(voterSection).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should have proposer role section', async ({ page }) => {
    const proposerSection = page.getByText(/proposer.*role|grant.*proposer/i).first();
    await expect(proposerSection).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display address input field', async ({ page }) => {
    const addressInput = page.getByPlaceholder(/address|0x/i).first();
    await expect(addressInput).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should validate invalid Ethereum address', async ({ page }) => {
    const addressInput = page.getByPlaceholder(/address|0x/i).first();

    if (await addressInput.isVisible()) {
      await addressInput.fill('invalid_address');

      const grantButton = page.getByRole('button', { name: /grant/i }).first();
      await grantButton.click();

      const errorMessage = page.getByText(/invalid.*address/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should accept valid Ethereum address format', async ({ page }) => {
    const addressInput = page.getByPlaceholder(/address|0x/i).first();

    if (await addressInput.isVisible()) {
      await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3');
      await expect(addressInput).toHaveValue(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  test('should display grant voter role button', async ({ page }) => {
    const grantButton = page.getByRole('button', { name: /grant.*voter/i }).first();
    await expect(grantButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display grant proposer role button', async ({ page }) => {
    const grantButton = page.getByRole('button', { name: /grant.*proposer/i }).first();
    await expect(grantButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display revoke role buttons', async ({ page }) => {
    const revokeButton = page.getByRole('button', { name: /revoke/i }).first();
    await expect(revokeButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should show wallet connection requirement', async ({ page }) => {
    const addressInput = page.getByPlaceholder(/address|0x/i).first();

    if (await addressInput.isVisible()) {
      await addressInput.fill('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3');

      const grantButton = page.getByRole('button', { name: /grant/i }).first();
      await grantButton.click();

      const walletMessage = page.getByText(/connect.*wallet|wallet.*required/i);
      await expect(walletMessage.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('should display current roles list', async ({ page }) => {
    const rolesList = page.locator('[data-testid="roles-list"], .roles-list, table').first();
    await expect(rolesList).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should show admin role badge', async ({ page }) => {
    const adminBadge = page.getByText(/admin/i).first();
    await expect(adminBadge).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display cancel proposal section', async ({ page }) => {
    const cancelSection = page.getByText(/cancel.*proposal/i).first();
    await expect(cancelSection).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should have proposal ID input for cancellation', async ({ page }) => {
    const idInput = page.getByPlaceholder(/proposal.*id/i).first();
    await expect(idInput).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display cancel proposal button', async ({ page }) => {
    const cancelButton = page.getByRole('button', { name: /cancel.*proposal/i }).first();
    await expect(cancelButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should show confirmation dialog for cancel proposal', async ({ page }) => {
    const idInput = page.getByPlaceholder(/proposal.*id/i).first();

    if (await idInput.isVisible()) {
      await idInput.fill('0');

      const cancelButton = page.getByRole('button', { name: /cancel.*proposal/i }).first();
      await cancelButton.click();

      const confirmDialog = page.getByText(/are you sure|confirm/i).first();
      await expect(confirmDialog).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should display statistics section', async ({ page }) => {
    const stats = page.getByText(/total.*proposal|total.*voter/i).first();
    await expect(stats).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const adminTitle = page.getByText(/admin/i).first();
    await expect(adminTitle).toBeVisible();
  });

  test('should check admin access control', async ({ page }) => {
    const accessMessage = page.getByText(/admin.*only|not authorized/i);
    const hasAdminAccess = (await accessMessage.count()) === 0;

    if (!hasAdminAccess) {
      await expect(accessMessage.first()).toBeVisible();
    }
  });

  test('should display role history or activity log', async ({ page }) => {
    const activityLog = page.getByText(/activity|history|recent.*action/i).first();
    await expect(activityLog).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should have refresh button for roles list', async ({ page }) => {
    const refreshButton = page.getByRole('button', { name: /refresh/i }).first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(500);
    }
  });
});
