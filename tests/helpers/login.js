/**
 * WordPress login helper for Playwright tests.
 *
 * Usage:
 *   import { loginAsAdmin } from './helpers/login.js';
 *   await loginAsAdmin(page);
 */

/**
 * Log in to WordPress as the admin user.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.username]
 * @param {string} [options.password]
 */
export async function loginAsAdmin(page, options = {}) {
  const username = options.username || process.env.WP_USERNAME || 'admin';
  const password = options.password || process.env.WP_PASSWORD || 'admin';

  await page.goto('/wp-login.php');
  await page.locator('#user_login').fill(username);
  await page.locator('#user_pass').fill(password);
  await page.locator('#wp-submit').click();
  await page.waitForURL('**/wp-admin/**');
}
