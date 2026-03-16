import { expect } from '@playwright/test';
import { installAndActivatePlugin } from './wordpress-plugin-manager.js';
import { BASE_URL, PLUGIN_SLUG, PLUGIN_NAME } from '../config/test-config.js';

/**
 * Install and activate the Instagram Feed plugin.
 * Handles 3 scenarios: already active, installed but inactive, not installed.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 */
export async function installInstagramFeed(page, options = {}) {
  const { baseUrl = BASE_URL } = options;

  console.log('Starting Instagram Feed plugin installation...');

  // Check current state on plugins page
  await page.goto(`${baseUrl}/wp-admin/plugins.php`);
  await page.waitForSelector('.wrap h1', { timeout: 5000 });

  const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
  const isInstalled = (await pluginRow.count()) > 0;

  if (isInstalled) {
    // Already active
    const deactivateLink = pluginRow.locator('.deactivate a');
    if ((await deactivateLink.count()) > 0) {
      console.log(`✓ "${PLUGIN_NAME}" is already installed and active`);
      return;
    }

    // Installed but inactive — activate
    console.log(`"${PLUGIN_NAME}" is installed but not active. Activating...`);
    const activateLink = pluginRow.locator('.activate a');
    await activateLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify activation
    await page.goto(`${baseUrl}/wp-admin/plugins.php`);
    const activatedRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
    await expect(activatedRow.locator('.deactivate')).toBeVisible();
    console.log(`✓ "${PLUGIN_NAME}" activated successfully`);
    return;
  }

  // Not installed — install from WordPress.org
  console.log(`"${PLUGIN_NAME}" not found. Installing from WordPress.org...`);

  await page.goto(`${baseUrl}/wp-admin/plugin-install.php`);
  await page.waitForSelector('#search-plugins', { timeout: 5000 });
  await page.fill('#search-plugins', PLUGIN_SLUG);
  await page.press('#search-plugins', 'Enter');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  await page.waitForSelector('.plugin-card', { timeout: 30000 });
  const pluginCard = page.locator(`.plugin-card-${PLUGIN_SLUG}`).first();
  await expect(pluginCard).toBeVisible({ timeout: 15000 });
  console.log(`✓ "${PLUGIN_NAME}" found in search results`);

  // Install
  const installButton = pluginCard.locator('.install-now, button:has-text("Install Now")').first();
  await expect(installButton).toBeVisible();
  await installButton.click();
  await page.waitForSelector('button:has-text("Activate"), a:has-text("Activate")', { timeout: 30000 });
  console.log(`✓ "${PLUGIN_NAME}" installed`);

  // Activate
  const activateBtn = page.locator('button:has-text("Activate"), a:has-text("Activate")').first();
  await activateBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log(`✓ "${PLUGIN_NAME}" activated`);

  // Verify
  await page.goto(`${baseUrl}/wp-admin/plugins.php`);
  const finalRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
  await expect(finalRow).toBeVisible({ timeout: 5000 });
  await expect(finalRow.locator('.deactivate')).toBeVisible();
  console.log(`✓ "${PLUGIN_NAME}" installation verified`);
}

/**
 * Deactivate and delete the Instagram Feed plugin.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 */
export async function removeInstagramFeed(page, options = {}) {
  const { baseUrl = BASE_URL } = options;

  await page.goto(`${baseUrl}/wp-admin/plugins.php`);
  await page.waitForLoadState('networkidle');

  const pluginRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
  if ((await pluginRow.count()) === 0) {
    console.log(`✓ "${PLUGIN_NAME}" is not installed. Nothing to remove.`);
    return;
  }

  // Deactivate if active
  const deactivateLink = pluginRow.locator('.deactivate a');
  if ((await deactivateLink.count()) > 0) {
    console.log(`Deactivating "${PLUGIN_NAME}"...`);
    await deactivateLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`✓ "${PLUGIN_NAME}" deactivated`);
  }

  // Delete
  await page.goto(`${baseUrl}/wp-admin/plugins.php`);
  await page.waitForTimeout(1000);

  const refreshedRow = page.locator(`tr[data-slug="${PLUGIN_SLUG}"]`).first();
  const deleteLink = refreshedRow.locator('.delete a');

  if ((await deleteLink.count()) > 0) {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log(`✓ "${PLUGIN_NAME}" deleted`);
  }
}
