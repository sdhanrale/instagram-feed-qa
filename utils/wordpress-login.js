import { expect } from '@playwright/test';
import { BASE_URL, WP_USERNAME, WP_PASSWORD } from '../config/test-config.js';

/**
 * Login to WordPress as admin.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.username]
 * @param {string} [options.password]
 * @param {string} [options.baseUrl]
 */
export async function loginToWordPress(page, options = {}) {
  const {
    username = WP_USERNAME,
    password = WP_PASSWORD,
    baseUrl = BASE_URL,
  } = options;

  await page.goto(`${baseUrl}/wp-login.php`);
  await page.locator('#user_login').fill(username);
  await page.locator('#user_pass').fill(password);
  await page.locator('#wp-submit').click();
  await page.waitForURL('**/wp-admin/**');
}
