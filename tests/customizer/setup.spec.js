import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { loginToWordPress } from '../../utils/wordpress-login.js';
import { resetWordPress } from '../../utils/wordpress-reset.js';
import { installInstagramFeed } from '../../utils/instagram-feed-installer.js';
import { runSetupWizard } from '../../utils/instagram-feed-setup-wizard.js';
import { connectInstagramAccount } from '../../utils/instagram-account-connect.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD, PLUGIN_SLUG, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } from '../../config/test-config.js';

test.describe('Customizer - Setup', () => {
  test.setTimeout(600000); // 10 minutes

  test('should reset, install, connect, create feed, and embed to page', async ({ page }) => {
    // Step 1: Login
    console.log('=== Step 1: Logging in to WordPress ===');
    await loginToWordPress(page, {
      username: WP_USERNAME,
      password: WP_PASSWORD,
      baseUrl: BASE_URL,
    });
    console.log('✓ Logged in\n');

    // Step 2: Reset WordPress
    console.log('=== Step 2: Resetting WordPress ===');
    await resetWordPress(page, {
      username: WP_USERNAME,
      password: WP_PASSWORD,
      baseUrl: BASE_URL,
    });
    console.log('✓ WordPress reset complete\n');

    // Step 3: Install Instagram Feed
    console.log('=== Step 3: Installing Instagram Feed plugin ===');
    await installInstagramFeed(page, { baseUrl: BASE_URL });
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
    await expect(pluginRow).toBeVisible();
    await expect(pluginRow.locator('.deactivate')).toBeVisible();
    console.log('✓ Instagram Feed installed and active\n');

    // Step 4: Setup Wizard
    console.log('=== Step 4: Running Setup Wizard ===');
    await runSetupWizard(page, { baseUrl: BASE_URL });
    console.log('✓ Setup wizard complete\n');

    // Step 5: Connect Instagram Account
    console.log('=== Step 5: Connecting Instagram Account ===');
    await connectInstagramAccount(page, {
      baseUrl: BASE_URL,
      instagramUsername: INSTAGRAM_USERNAME,
      instagramPassword: INSTAGRAM_PASSWORD,
    });
    console.log('✓ Instagram account connected\n');

    // Step 6: Create a new feed
    console.log('=== Step 6: Creating a New Feed ===');
    await page.getByRole('link', { name: 'All Feeds' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.locator('.sbi-fb-btn').click();
    await page.waitForTimeout(2000);

    await page.getByText('Next').first().click();
    await page.waitForTimeout(2000);

    await page.locator('.sbi-fb-srcs-item-chkbx').click();
    await page.waitForTimeout(1000);

    await page.locator('.sbi-fb-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Complete onboarding tooltips
    await page.locator('#sb-onboarding-tooltip-customizer-1').getByText('Next').click();
    await page.waitForTimeout(1000);
    await page.locator('#sb-onboarding-tooltip-customizer-2').getByText('Next').click();
    await page.waitForTimeout(1000);
    await page.getByText('Finish').click();
    await page.waitForTimeout(1000);
    console.log('✓ Feed created and customizer opened\n');

    // Step 7: Save feed with defaults
    console.log('=== Step 7: Saving Feed ===');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Feed saved\n');

    // Step 8: Embed feed to a page
    console.log('=== Step 8: Embedding Feed to a Page ===');

    await page.getByRole('button', { name: 'Embed' }).click();
    await page.waitForTimeout(2000);

    await page.locator('a').filter({ hasText: 'Add to a Page' }).click();
    await page.waitForTimeout(2000);

    await page.locator('.sbi-fb-embed-step-2-pages .sb-control-toggle-elm').click();
    await page.waitForTimeout(1000);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Add', exact: true }).click();
    const page1 = await page1Promise;
    await page1.waitForLoadState('load');
    await page1.waitForTimeout(5000);

    // Close editor dialog if present
    const closeButton = page1.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await closeButton.click();
      await page1.waitForTimeout(1000);
    }

    // Add Instagram Feed block
    await page1.getByRole('button', { name: 'Block Inserter' }).click();
    await page1.waitForTimeout(1000);
    await page1.getByRole('searchbox', { name: 'Search' }).click();
    await page1.getByRole('searchbox', { name: 'Search' }).fill('feed');
    await page1.waitForTimeout(1000);
    await page1.getByRole('option', { name: 'Instagram Feed' }).click();
    await page1.waitForTimeout(2000);

    // Move block up
    const moveUpButton = page1.getByRole('button', { name: 'Move up' });
    for (let i = 0; i < 5; i++) {
      if (await moveUpButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moveUpButton.click();
        await page1.waitForTimeout(500);
      }
    }

    // Save the page
    await page1.getByRole('button', { name: 'Save', exact: true }).click();
    await page1.waitForTimeout(5000);
    console.log('✓ Feed embedded and page saved\n');

    // Verify frontend
    const page2Promise = page1.waitForEvent('popup');
    await page1.getByRole('link', { name: 'View Page(opens in a new tab)' }).click();
    const page2 = await page2Promise;
    await page2.waitForLoadState('load');
    await page2.waitForTimeout(5000);

    const frontendFeed = page2.locator('#sb_instagram');
    await expect(frontendFeed).toBeVisible({ timeout: 15000 });
    console.log('✓ Feed visible on frontend\n');

    // Save auth state for dependent tests (after all setup so cookies are valid)
    const authDir = path.resolve('.auth');
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
    await page.context().storageState({ path: path.join(authDir, 'storage-state.json') });
    console.log('✓ Auth state saved\n');

    console.log('=== Setup complete! Feed created and embedded. ===');
  });
});
