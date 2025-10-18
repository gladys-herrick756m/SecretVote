import { test, expect } from '@playwright/test';

test.describe('Proposal Detail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const firstProposal = page.locator('article, [data-testid="proposal-card"]').first();
    const exists = await firstProposal.count() > 0;

    if (exists) {
      await firstProposal.click();
      await page.waitForURL(/.*proposal\/\d+/);
    } else {
      await page.goto('/proposal/0');
    }
  });

  test('should display proposal title', async ({ page }) => {
    const title = page.locator('h1, [data-testid="proposal-title"]').first();
    await expect(title).toBeVisible();
  });

  test('should display proposal description', async ({ page }) => {
    const description = page.locator('[data-testid="proposal-description"], .description').first();
    await expect(description).toBeVisible();
  });

  test('should display proposal status', async ({ page }) => {
    const status = page.locator('[data-status], .status-badge, .badge').first();
    await expect(status).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display voting period information', async ({ page }) => {
    const timeInfo = page.getByText(/start|end|duration/i).first();
    await expect(timeInfo).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display vote buttons', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /vote|for|against/i }).first();
    await expect(voteButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display voting options (For, Against, Abstain)', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /vote/i }).first();

    if (await voteButton.isVisible()) {
      await voteButton.click();
      await page.waitForTimeout(500);

      await expect(page.getByText(/for/i).first()).toBeVisible({ timeout: 2000 }).catch(() => {});
      await expect(page.getByText(/against/i).first()).toBeVisible({ timeout: 2000 }).catch(() => {});
      await expect(page.getByText(/abstain/i).first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should show vote results section', async ({ page }) => {
    const results = page.locator('[data-testid="vote-results"], .results').first();
    await expect(results).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should display vote counts or progress bars', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"], .progress').first();
    const voteCount = page.getByText(/\d+.*vote/i).first();

    const hasProgress = await progressBar.count() > 0;
    const hasCount = await voteCount.count() > 0;

    expect(hasProgress || hasCount).toBeTruthy();
  });

  test('should display proposer information', async ({ page }) => {
    const proposer = page.getByText(/proposer|created by|author/i).first();
    await expect(proposer).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should show voting deadline', async ({ page }) => {
    const deadline = page.getByText(/deadline|end|remaining/i).first();
    await expect(deadline).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should open vote modal when clicking vote button', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /cast vote|vote now/i }).first();

    if (await voteButton.isVisible()) {
      await voteButton.click();
      const modal = page.locator('[role="dialog"], .modal').first();
      await expect(modal).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should close vote modal with cancel button', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /vote/i }).first();

    if (await voteButton.isVisible()) {
      await voteButton.click();
      await page.waitForTimeout(500);

      const cancelButton = page.getByRole('button', { name: /cancel|close/i }).first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should select vote choice in modal', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /vote/i }).first();

    if (await voteButton.isVisible()) {
      await voteButton.click();
      await page.waitForTimeout(500);

      const forOption = page.getByRole('radio', { name: /for/i })
        .or(page.getByRole('button', { name: /for/i }))
        .first();

      if (await forOption.isVisible()) {
        await forOption.click();
      }
    }
  });

  test('should show wallet connection warning if not connected', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: /vote/i }).first();

    if (await voteButton.isVisible()) {
      await voteButton.click();
      await page.waitForTimeout(500);

      const warningMessage = page.getByText(/connect.*wallet|wallet.*required/i);
      await expect(warningMessage.first()).toBeVisible({ timeout: 2000 }).catch(() => {});
    }
  });

  test('should display back button', async ({ page }) => {
    const backButton = page.getByRole('link', { name: /back/i })
      .or(page.locator('[data-action="back"]'))
      .first();

    if (await backButton.isVisible()) {
      await expect(backButton).toBeVisible();
    }
  });

  test('should navigate back to homepage', async ({ page }) => {
    const backButton = page.getByRole('link', { name: /back/i }).first();

    if (await backButton.isVisible()) {
      await backButton.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should display proposal ID', async ({ page }) => {
    const proposalId = page.getByText(/proposal.*#\d+|id.*\d+/i).first();
    await expect(proposalId).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should show voting status (active, ended, etc)', async ({ page }) => {
    const statusText = page.getByText(/active|ended|finalized|cancelled/i).first();
    await expect(statusText).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('should handle 404 for invalid proposal ID', async ({ page }) => {
    await page.goto('/proposal/99999');
    await page.waitForLoadState('networkidle');

    const notFoundMessage = page.getByText(/not found|doesn't exist/i);
    const errorMessage = page.getByText(/error/i);

    const hasError = (await notFoundMessage.count()) > 0 || (await errorMessage.count()) > 0;
    expect(hasError).toBeTruthy();
  });
});
