import { test, expect } from '@playwright/test';
import { loginToWordPress } from '../utils/wordpress-login.js';
import { resetWordPress } from '../utils/wordpress-reset.js';
import { installInstagramFeed } from '../utils/instagram-feed-installer.js';
import { runSetupWizard } from '../utils/instagram-feed-setup-wizard.js';
import { connectInstagramAccount } from '../utils/instagram-account-connect.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD, PLUGIN_SLUG, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } from '../config/test-config.js';

test.describe('Instagram Feed Create', () => {
  test.setTimeout(600000); // 10 minutes for full flow + feed creation

  test('should reset, install, connect account, and create a new feed', async ({ page }) => {
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

    // Step 3: Install and activate Instagram Feed plugin
    console.log('=== Step 3: Installing Instagram Feed plugin ===');
    await installInstagramFeed(page, { baseUrl: BASE_URL });

    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
    await expect(pluginRow).toBeVisible();
    await expect(pluginRow.locator('.deactivate')).toBeVisible();
    console.log('✓ Instagram Feed installed and active\n');

    // Step 4: Run the setup wizard
    console.log('=== Step 4: Running Setup Wizard ===');
    await runSetupWizard(page, { baseUrl: BASE_URL });
    console.log('✓ Setup wizard complete\n');

    // Step 5: Connect Instagram account
    console.log('=== Step 5: Connecting Instagram Account ===');
    await connectInstagramAccount(page, {
      baseUrl: BASE_URL,
      instagramUsername: INSTAGRAM_USERNAME,
      instagramPassword: INSTAGRAM_PASSWORD,
    });
    console.log('✓ Instagram account connected\n');

    // Step 6: Create a new feed
    console.log('=== Step 6: Creating a New Feed ===');

    // Navigate to All Feeds
    console.log('Step 6a: Navigating to All Feeds...');
    await page.getByRole('link', { name: 'All Feeds' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Navigated to All Feeds');

    // Click Add New feed button
    console.log('Step 6b: Clicking Add New...');
    await page.locator('.sbi-fb-btn').click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Add New');

    // Click Next
    console.log('Step 6c: Clicking Next...');
    await page.getByText('Next').first().click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Next');

    // Select source
    console.log('Step 6d: Selecting source...');
    await page.locator('.sbi-fb-srcs-item-chkbx').click();
    await page.waitForTimeout(1000);
    console.log('✓ Selected source');

    // Click Next/Create
    console.log('Step 6e: Creating feed...');
    await page.locator('.sbi-fb-btn').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✓ Feed created');

    // Step 7: Walk through the feed customizer onboarding
    console.log('=== Step 7: Completing Feed Customizer Onboarding ===');

    // Onboarding tooltip 1 - Next
    console.log('Step 7a: Onboarding tooltip 1...');
    await page.locator('#sb-onboarding-tooltip-customizer-1').getByText('Next').click();
    await page.waitForTimeout(1000);
    console.log('✓ Tooltip 1 done');

    // Onboarding tooltip 2 - Next
    console.log('Step 7b: Onboarding tooltip 2...');
    await page.locator('#sb-onboarding-tooltip-customizer-2').getByText('Next').click();
    await page.waitForTimeout(1000);
    console.log('✓ Tooltip 2 done');

    // Finish onboarding
    console.log('Step 7c: Finishing onboarding...');
    await page.getByText('Finish').click();
    await page.waitForTimeout(1000);
    console.log('✓ Onboarding finished');

    // Save the feed
    console.log('Step 7d: Saving feed...');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Feed saved');

    // Step 8: Embed the feed to a page
    console.log('=== Step 8: Embedding Feed to a Page ===');

    // Click Embed
    console.log('Step 8a: Clicking Embed...');
    await page.getByRole('button', { name: 'Embed' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Embed');

    // Click "Add to a Page"
    console.log('Step 8b: Clicking Add to a Page...');
    await page.locator('a').filter({ hasText: 'Add to a Page' }).click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Add to a Page');

    // Toggle page selection
    console.log('Step 8c: Selecting page...');
    await page.locator('.sb-control-toggle-elm').click();
    await page.waitForTimeout(1000);
    console.log('✓ Selected page');

    // Click "Add" link which opens a new tab
    console.log('Step 8d: Opening page editor...');
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Add', exact: true }).click();
    const page1 = await page1Promise;
    await page1.waitForLoadState('load');
    await page1.waitForTimeout(5000);
    console.log('✓ Page editor opened');

    // Close any dialog in the editor
    console.log('Step 8e: Closing editor dialog...');
    const closeButton = page1.getByRole('button', { name: 'Close' });
    if (await closeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await closeButton.click();
      await page1.waitForTimeout(1000);
      console.log('✓ Closed editor dialog');
    }

    // Open Block Inserter and search for Instagram Feed
    console.log('Step 8f: Adding Instagram Feed block...');
    await page1.getByRole('button', { name: 'Block Inserter' }).click();
    await page1.waitForTimeout(1000);

    await page1.getByRole('searchbox', { name: 'Search' }).click();
    await page1.getByRole('searchbox', { name: 'Search' }).fill('feed');
    await page1.waitForTimeout(1000);

    await page1.getByRole('option', { name: 'Instagram Feed' }).click();
    await page1.waitForTimeout(2000);
    console.log('✓ Instagram Feed block added');

    // Move block up to position it at the top
    console.log('Step 8g: Moving block to top...');
    const moveUpButton = page1.getByRole('button', { name: 'Move up' });
    for (let i = 0; i < 5; i++) {
      if (await moveUpButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await moveUpButton.click();
        await page1.waitForTimeout(500);
      }
    }
    console.log('✓ Block moved to top');

    // Save the page
    console.log('Step 8h: Saving page...');
    await page1.getByRole('button', { name: 'Save', exact: true }).click();
    await page1.waitForTimeout(5000);
    console.log('✓ Page saved');

    // View the page
    console.log('Step 8i: Viewing page...');
    const page2Promise = page1.waitForEvent('popup');
    await page1.getByRole('link', { name: 'View Page(opens in a new tab)' }).click();
    const page2 = await page2Promise;
    await page2.waitForLoadState('load');
    await page2.waitForTimeout(3000);
    console.log('✓ Page opened in new tab');

    console.log('\n=== All 8 steps completed successfully! ===');
    console.log('Feed created, embedded, and viewable on the page.');
  });
});
