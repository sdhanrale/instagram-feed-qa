/**
 * WordPress reset helper using the WP Reset plugin.
 *
 * Requires the WP Reset plugin to be installed and active.
 * Plugin: https://wordpress.org/plugins/wp-reset/
 *
 * Usage:
 *   import { resetWordPress } from './helpers/reset.js';
 *   await resetWordPress(page);
 */

/**
 * Reset WordPress to its default state using the WP Reset plugin.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.username] - WordPress username (default: 'admin')
 * @param {string} [options.password] - WordPress password (default: 'admin')
 * @param {string} [options.baseUrl] - WordPress base URL
 */
export async function resetWordPress(page, options = {}) {
  const baseUrl = options.baseUrl || process.env.WP_BASE_URL || 'http://insta-feed-auto.local';
  const username = options.username || process.env.WP_USERNAME || 'admin';
  const password = options.password || process.env.WP_PASSWORD || 'admin';

  console.log('Starting WordPress reset...');

  // Navigate to WP Reset plugin page
  await page.goto(`${baseUrl}/wp-admin/tools.php?page=wp-reset`);
  await page.waitForLoadState('networkidle');

  // Scroll down to the Site Reset section
  const resetSection = page.locator('#wp-reset-card-reset');
  if (await resetSection.isVisible().catch(() => false)) {
    await resetSection.scrollIntoViewIfNeeded();
  }

  // Type "reset" in the confirmation field
  const resetInput = page.locator('input#wp_reset_confirm, input[name="wp_reset_confirm"]');
  await resetInput.waitFor({ state: 'visible', timeout: 10000 });
  await resetInput.fill('reset');
  console.log('✓ Typed "reset" in confirmation field');

  // Handle the confirmation dialog that appears after clicking reset
  page.on('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.accept();
  });

  // Click the "Reset WordPress" button
  const resetButton = page.locator('#wp_reset_submit, button:has-text("Reset WordPress"), input[value="Reset WordPress"]');
  await resetButton.waitFor({ state: 'visible', timeout: 5000 });
  await resetButton.click();
  console.log('✓ Clicked Reset WordPress button');

  // Wait for reset to complete — WordPress will reload
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);

  // After reset, we may need to log in again
  const currentUrl = page.url();
  if (currentUrl.includes('wp-login.php')) {
    console.log('Logging back in after reset...');
    await page.locator('#user_login').fill(username);
    await page.locator('#user_pass').fill(password);
    await page.locator('#wp-submit').click();
    await page.waitForURL('**/wp-admin/**');
    console.log('✓ Logged back in after reset');
  }

  console.log('✓ WordPress reset completed successfully');
}
