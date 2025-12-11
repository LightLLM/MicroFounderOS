import { test, expect } from '@playwright/test';

test('root redirects to /dashboard and page title is correct', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page).toHaveTitle(/MicroFounder OS/i);
});
