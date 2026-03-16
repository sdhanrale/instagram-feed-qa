import { test, expect } from '@playwright/test';
import { loginToWordPress } from '../utils/wordpress-login.js';
import { resetWordPress } from '../utils/wordpress-reset.js';
import { installInstagramFeed } from '../utils/instagram-feed-installer.js';
import { runSetupWizard } from '../utils/instagram-feed-setup-wizard.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD, PLUGIN_SLUG } from '../config/test-config.js';

test.describe('Instagram Feed Setup Wizard', () => {
  test.setTimeout(360000); // 6 minutes for full reset + install + wizard

  test('should reset WordPress, install Instagram Feed, and complete setup wizard', async ({ page }) => {
    // Step 1: Login to WordPress
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

    console.log('=== All steps completed successfully! ===');
  });
});
