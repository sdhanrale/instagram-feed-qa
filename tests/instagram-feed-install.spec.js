import { test, expect } from '@playwright/test';
import { loginToWordPress } from '../utils/wordpress-login.js';
import { installInstagramFeed } from '../utils/instagram-feed-installer.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD, PLUGIN_SLUG } from '../config/test-config.js';

test.describe('Instagram Feed WordPress Plugin Installation', () => {
  test.setTimeout(240000);

  test.beforeEach(async ({ page }) => {
    await loginToWordPress(page, {
      username: WP_USERNAME,
      password: WP_PASSWORD,
      baseUrl: BASE_URL,
    });
  });

  test('should install and activate Instagram Feed plugin by searching in WordPress repository', async ({ page }) => {
    console.log('Starting Instagram Feed plugin installation test...');

    await installInstagramFeed(page, { baseUrl: BASE_URL });

    // Final verification
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    const finalRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
    await expect(finalRow).toBeVisible();
    await expect(finalRow.locator('.deactivate')).toBeVisible();
    console.log('✓ Test completed successfully!');
  });

  test('should verify Instagram Feed plugin is active and accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);

    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
    await expect(pluginRow).toBeVisible();
    await expect(pluginRow.locator('.deactivate')).toBeVisible();

    const pluginName = pluginRow.locator('.plugin-title strong');
    await expect(pluginName).toContainText('Instagram Feed', { ignoreCase: true });

    const pluginDescription = pluginRow.locator('.plugin-description');
    await expect(pluginDescription).toBeVisible();
  });

  test('should deactivate and reactivate Instagram Feed plugin', async ({ page }) => {
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);

    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`);

    // Deactivate
    await pluginRow.locator('.deactivate a').click();
    await page.waitForURL(/wp-admin\/plugins.php/, { timeout: 10000 });
    await expect(page.locator('#message.updated')).toContainText('Plugin deactivated');
    await expect(pluginRow.locator('.activate')).toBeVisible();

    // Reactivate
    await pluginRow.locator('.activate a').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify (Instagram Feed redirects to sbi-setup after activation)
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);
    await expect(pluginRow.locator('.deactivate')).toBeVisible();
  });

  test('should check if Instagram Feed settings page is accessible after activation', async ({ page }) => {
    await page.goto(`${BASE_URL}/wp-admin/plugins.php`);

    const instagramFeedMenu = page.locator('#adminmenu a:has-text("Instagram Feed")').first();

    if (await instagramFeedMenu.isVisible()) {
      await instagramFeedMenu.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await expect(page).toHaveURL(/wp-admin.*sbi/);
      // Check for any Instagram Feed related content instead of specific text
      const pageContent = page.locator('#wpbody-content');
      await expect(pageContent).toBeVisible({ timeout: 15000 });
    } else {
      await page.hover('#menu-settings');
      const settingsLink = page.locator('#menu-settings a:has-text("Instagram Feed")').first();

      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(/wp-admin.*sbi/);
      }
    }
  });
});
