import { test, expect } from '@playwright/test';

test.describe('E2E Flow', () => {
  const email = 'e2e_tester@example.com';
  const password = 'Password123!';
  const appUrl = 'http://localhost:8080';

  test('User can login and interact with all components perfectly', async ({ page }) => {
    // 1. Login
    console.log('Navigating to auth page...');
    await page.goto(`${appUrl}/auth`);
    
    await page.fill('input#email', email);
    await page.fill('input#password', password);
    await page.click('button:has-text("Sign in")');
    
    console.log('Waiting for login redirect...');
    await expect(page.locator('h1').filter({ hasText: 'LIFT' }).first()).toBeVisible({ timeout: 15000 });
    
    const clickNav = async (path: string) => {
      const locators = page.locator(`a[href="${path}"]`);
      const count = await locators.count();
      if (count > 0) {
        await locators.nth(count - 1).click({ force: true });
      }
    };

    // 2. Profile Tab
    console.log('Checking Profile tab...');
    await clickNav('/profile');
    // We should see Sign out
    await expect(page.locator('text=Sign out').first()).toBeVisible();

    // 3. Body Tab
    console.log('Checking Body tab...');
    await clickNav('/body');
    await expect(page.locator('text=Measurements').first()).toBeVisible();
    
    // 4. Plan Tab
    console.log('Checking Plan tab...');
    await clickNav('/plan');
    await expect(page.locator('text=Workout Plan').first()).toBeVisible();
    
    // 5. Workout Logging Flow
    console.log('Starting workout flow...');
    await page.goto(`${appUrl}/workout/thursday?start=true`);
    await expect(page.locator('text=Finish Workout').first()).toBeVisible();

    console.log('Logging a set...');
    const logButton = page.locator('button:has-text("Log")').first();
    await logButton.click({ force: true });
    await page.waitForTimeout(1000); 

    console.log('Finishing workout...');
    await page.locator('button:has-text("Finish Workout")').first().click({ force: true });
    
    console.log('Verifying completion screen layout...');
    await expect(page.locator('text=Workout Complete').first()).toBeVisible();
  });
});
