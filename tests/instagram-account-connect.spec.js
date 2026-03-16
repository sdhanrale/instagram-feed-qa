import { test, expect } from '@playwright/test';
import { loginToWordPress } from '../utils/wordpress-login.js';
import { resetWordPress } from '../utils/wordpress-reset.js';
import { installInstagramFeed } from '../utils/instagram-feed-installer.js';
import { runSetupWizard } from '../utils/instagram-feed-setup-wizard.js';
import { connectInstagramAccount } from '../utils/instagram-account-connect.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD, PLUGIN_SLUG, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } from '../config/test-config.js';

test.describe('Instagram Account Connect', () => {
  test.setTimeout(420000); // 7 minutes for reset + install + OAuth flow

  test('should reset WordPress, install plugin, and connect Instagram account', async ({ page }) => {
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

    // Verify plugin is active
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
    console.log(`Using Instagram account: ${INSTAGRAM_USERNAME}`);
    await connectInstagramAccount(page, {
      baseUrl: BASE_URL,
      instagramUsername: INSTAGRAM_USERNAME,
      instagramPassword: INSTAGRAM_PASSWORD,
    });
    console.log('✓ Instagram account connected\n');

    console.log('=== All 5 steps completed successfully! ===');
  });
});
