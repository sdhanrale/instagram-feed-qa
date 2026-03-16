import { expect } from '@playwright/test';
import { installAndActivatePlugin } from './wordpress-plugin-manager.js';
import { BASE_URL, WP_USERNAME, WP_PASSWORD } from '../config/test-config.js';

/**
 * Resets WordPress website using WP Reset plugin.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {object} [options]
 * @param {string} [options.username] - WordPress username (default from config)
 * @param {string} [options.password] - WordPress password (default from config)
 * @param {string} [options.baseUrl] - WordPress base URL (default from config)
 */
export async function resetWordPress(page, options = {}) {
  const {
    username = WP_USERNAME,
    password = WP_PASSWORD,
    baseUrl = BASE_URL,
  } = options;

  console.log('Starting WordPress website reset...');

  // Step 1: Login to WordPress (if not already logged in)
  console.log('Step 1: Logging in to WordPress...');
  await page.goto(`${baseUrl}/wp-login.php`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Check if already logged in by looking for dashboard
  const currentUrl = page.url();
  if (!currentUrl.includes('wp-admin')) {
    // Fill in login form
    await page.fill('#user_login', username);
    await page.fill('#user_pass', password);
    await page.click('#wp-submit');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify we're now in wp-admin
    await expect(page).toHaveURL(/wp-admin/);
  }
  console.log('✓ Logged in to WordPress');

  // Step 2: Install and activate WP Reset plugin using plugin manager
  console.log('Step 2: Ensuring WP Reset plugin is installed and active...');
  await installAndActivatePlugin(page, {
    pluginSlug: 'wp-reset',
    pluginName: 'WP Reset',
    pluginSettingsUrl: 'tools.php?page=wp-reset',
    baseUrl: baseUrl,
    navigateToSettings: true,
  });
  console.log('✓ WP Reset plugin is installed and active');

  // Navigate to WP Reset page
  console.log('Step 3: Navigating to WP Reset page...');
  await page.goto(`${baseUrl}/wp-admin/tools.php?page=wp-reset`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  console.log('✓ Navigated to WP Reset settings page');

  // Step 4: Close the popup by pressing Escape
  console.log('Step 4: Closing popup/modal...');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  console.log('✓ Closed popup');

  // Step 5: Go to "Site Reset" section and perform reset
  console.log('Step 5: Going to Site Reset section...');

  // Look for "Site Reset" section header - it might be collapsed, click to expand
  const siteResetSection = page.locator('text=/Site Reset/i').first();
  if (await siteResetSection.isVisible()) {
    await siteResetSection.click();
    await page.waitForTimeout(1000);
    console.log('✓ Clicked on Site Reset section');
  }

  // Scroll to the Site Reset section
  await page.evaluate(() => {
    const element = document.querySelector('input[placeholder*="reset"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  await page.waitForTimeout(1000);

  // Find the reset confirmation input by placeholder
  console.log('Looking for reset confirmation input...');
  const resetInput = page.locator('input[placeholder*="reset"]').first();
  await resetInput.waitFor({ state: 'visible', timeout: 10000 });

  // Clear and type "reset"
  await resetInput.click();
  await resetInput.fill('reset');
  console.log('✓ Entered "reset" in confirmation field');
  await page.waitForTimeout(1000);

  // Find and click the "Reset Site" button
  console.log('Looking for Reset Site button...');
  const resetButton = page.locator('text="Reset Site"').first();
  await resetButton.waitFor({ state: 'visible', timeout: 10000 });
  await resetButton.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Click the button
  await resetButton.click();
  console.log('✓ Clicked Reset Site button');

  // Wait for confirmation popup to appear
  await page.waitForTimeout(2000);

  // Handle confirmation popup - "Are you sure you want to reset the site?"
  console.log('Looking for confirmation popup...');
  const confirmPopup = page.locator('text=/Are you sure.*reset.*site/i').first();
  await confirmPopup.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✓ Confirmation popup detected: "Are you sure you want to reset the site?"');

  // Click "Reset WordPress" button in the confirmation popup
  const confirmResetButton = page.locator('button:has-text("Reset WordPress")').first();
  await confirmResetButton.waitFor({ state: 'visible', timeout: 5000 });
  await confirmResetButton.click();
  console.log('✓ Clicked Reset WordPress button in confirmation popup');

  // Wait for reset to complete - the actual website reset operation
  console.log('⏳ Waiting for WordPress site reset to complete...');
  await page.waitForTimeout(12000); // Increased to 12 seconds for reset operation
  console.log('✓ WordPress site reset operation completed');

  // Step 6: Go to login page and login again
  console.log('Step 6: Logging back in after reset...');
  await page.goto(`${baseUrl}/wp-login.php`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Fill login credentials
  await page.fill('#user_login', username);
  await page.fill('#user_pass', password);
  await page.click('#wp-submit');

  // Verify successful login
  await expect(page).toHaveURL(/wp-admin/);
  console.log('✓ Successfully logged back in');

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ WordPress website reset completed successfully!');
}
