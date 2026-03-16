import { test } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.js';
import { resetWordPress } from '../utils/wordpress-reset.js';
import { BASE_URL } from '../config/test-config.js';

test.describe('WordPress Website Reset', () => {
  // Configure test timeout for reset operations
  test.setTimeout(120000);

  test('should reset WordPress website using WP Reset plugin', async ({ page }) => {
    // Step 1: Login to WordPress
    await loginAsAdmin(page, {
      username: process.env.WP_USERNAME || 'admin',
      password: process.env.WP_PASSWORD || 'admin',
    });

    // Step 2: Reset WordPress using utility function
    await resetWordPress(page, {
      username: process.env.WP_USERNAME || 'admin',
      password: process.env.WP_PASSWORD || 'admin',
      baseUrl: BASE_URL,
    });
  });
});
