import { expect } from '@playwright/test';
import { BASE_URL } from '../config/test-config.js';

/**
 * Install and activate a WordPress plugin from the repository.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} options
 * @param {string} options.pluginSlug - Plugin slug (e.g. 'wp-reset')
 * @param {string} options.pluginName - Plugin display name (e.g. 'WP Reset')
 * @param {string} [options.pluginSettingsUrl] - Settings page URL path (e.g. 'tools.php?page=wp-reset')
 * @param {string} [options.baseUrl] - WordPress base URL
 * @param {boolean} [options.navigateToSettings] - Navigate to settings page after activation
 */
export async function installAndActivatePlugin(page, options) {
  const {
    pluginSlug,
    pluginName,
    pluginSettingsUrl,
    baseUrl = BASE_URL,
    navigateToSettings = false,
  } = options;

  console.log(`Checking if "${pluginName}" plugin is installed...`);

  // Navigate to plugins page
  await page.goto(`${baseUrl}/wp-admin/plugins.php`);
  await page.waitForLoadState('networkidle');

  const pluginRow = page.locator(`tr[data-slug="${pluginSlug}"]`).first();
  const isInstalled = (await pluginRow.count()) > 0;

  if (isInstalled) {
    // Check if already active
    const deactivateLink = pluginRow.locator('.deactivate a');
    if ((await deactivateLink.count()) > 0) {
      console.log(`✓ "${pluginName}" is already installed and active`);

      if (navigateToSettings && pluginSettingsUrl) {
        await page.goto(`${baseUrl}/wp-admin/${pluginSettingsUrl}`);
        await page.waitForLoadState('networkidle');
      }
      return;
    }

    // Plugin installed but not active — activate it
    console.log(`"${pluginName}" is installed but not active. Activating...`);
    const activateLink = pluginRow.locator('.activate a');
    await activateLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`✓ "${pluginName}" activated`);

    if (navigateToSettings && pluginSettingsUrl) {
      await page.goto(`${baseUrl}/wp-admin/${pluginSettingsUrl}`);
      await page.waitForLoadState('networkidle');
    }
    return;
  }

  // Plugin not installed — install from WordPress.org
  console.log(`"${pluginName}" not found. Installing from WordPress.org...`);
  await page.goto(`${baseUrl}/wp-admin/plugin-install.php`);
  await page.waitForLoadState('networkidle');

  // Search for plugin
  await page.waitForSelector('#search-plugins', { timeout: 5000 });
  await page.fill('#search-plugins', pluginSlug);
  await page.press('#search-plugins', 'Enter');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Find plugin card
  await page.waitForSelector('.plugin-card', { timeout: 30000 });
  const pluginCard = page.locator(`.plugin-card-${pluginSlug}`).first();
  await expect(pluginCard).toBeVisible({ timeout: 15000 });

  // Install
  const installButton = pluginCard.locator('.install-now').first();
  await expect(installButton).toBeVisible();
  await installButton.click();

  // Wait for install to complete
  await page.waitForSelector('button:has-text("Activate"), a:has-text("Activate")', { timeout: 30000 });
  console.log(`✓ "${pluginName}" installed`);

  // Activate
  const activateBtn = page.locator('button:has-text("Activate"), a:has-text("Activate")').first();
  await activateBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log(`✓ "${pluginName}" activated`);

  if (navigateToSettings && pluginSettingsUrl) {
    await page.goto(`${baseUrl}/wp-admin/${pluginSettingsUrl}`);
    await page.waitForLoadState('networkidle');
  }
}
