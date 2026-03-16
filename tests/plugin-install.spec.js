// @ts-check
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.js';

const PLUGIN_SLUG = process.env.PLUGIN_SLUG || 'instagram-feed';
const PLUGIN_NAME = process.env.PLUGIN_NAME || 'Instagram Feed';

test.describe('WordPress Plugin Install', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should search and install the plugin from WordPress.org', async ({ page }) => {
    // Navigate to Add New Plugin page
    await page.goto('/wp-admin/plugin-install.php');
    await expect(page.locator('.wrap h1').first()).toBeVisible();

    // Search for the plugin
    const searchInput = page.locator('#search-plugins');
    await searchInput.fill(PLUGIN_SLUG);

    // Wait for search results to load
    await page.waitForSelector(`.plugin-card-${PLUGIN_SLUG}`, { timeout: 15_000 });

    // Verify the plugin card is visible
    const pluginCard = page.locator(`.plugin-card-${PLUGIN_SLUG}`);
    await expect(pluginCard).toBeVisible();

    // Check the full plugin card text to determine current state
    const cardText = (await pluginCard.textContent()) || '';

    if (cardText.includes('Active')) {
      console.log(`Plugin "${PLUGIN_NAME}" is already installed and active.`);
      return;
    }

    if (cardText.includes('Activate')) {
      console.log(`Plugin "${PLUGIN_NAME}" is already installed but not active.`);
      return;
    }

    // Click "Install Now"
    const installButton = pluginCard.locator('a.install-now');
    await expect(installButton).toBeVisible();
    await installButton.click();

    // Wait for installation to complete — button changes to "Activate"
    await expect(pluginCard.locator('a.activate-now')).toBeVisible({ timeout: 30_000 });
  });

  test('should activate the plugin after installation', async ({ page }) => {
    // Navigate to the installed plugins page
    await page.goto('/wp-admin/plugins.php');

    // Find the plugin row
    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`);

    if (await pluginRow.isVisible().catch(() => false)) {
      // Check if already active
      const deactivateLink = pluginRow.locator('a[href*="action=deactivate"]');
      if (await deactivateLink.isVisible().catch(() => false)) {
        console.log(`Plugin "${PLUGIN_NAME}" is already active.`);
        await expect(pluginRow).toHaveClass(/active/);
        return;
      }

      // Activate the plugin
      const activateLink = pluginRow.locator('a[href*="action=activate"]');
      await expect(activateLink).toBeVisible();
      await activateLink.click();

      // Some plugins redirect to their own setup page after activation
      // Wait for navigation to complete, then verify on the plugins page
      await page.waitForLoadState('load');

      // Navigate to plugins page to verify activation
      await page.goto('/wp-admin/plugins.php');
      const activeRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"].active`);
      await expect(activeRow).toBeVisible();
    } else {
      // Plugin not found — need to install first
      throw new Error(`Plugin "${PLUGIN_NAME}" is not installed. Run the install test first.`);
    }
  });

  test('should show the plugin in the active plugins list', async ({ page }) => {
    await page.goto('/wp-admin/plugins.php?plugin_status=active');

    const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`);
    await expect(pluginRow).toBeVisible();
    await expect(pluginRow).toHaveClass(/active/);
  });
});
