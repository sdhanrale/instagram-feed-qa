// @ts-check
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/login.js';

test.describe('WordPress Admin Login', () => {
  test('should display the login page', async ({ page }) => {
    await page.goto('/wp-login.php');
    await expect(page.locator('#loginform')).toBeVisible();
    await expect(page.locator('#user_login')).toBeVisible();
    await expect(page.locator('#user_pass')).toBeVisible();
    await expect(page.locator('#wp-submit')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/wp-login.php');
    await page.locator('#user_login').fill('invalid_user');
    await page.locator('#user_pass').fill('wrong_password');
    await page.locator('#wp-submit').click();
    await expect(page.locator('#login_error')).toBeVisible();
  });

  test('should log in with valid admin credentials', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/wp-admin\//);
    await expect(page.locator('#wpadminbar')).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/wp-admin/');
    await expect(page).toHaveURL(/wp-login\.php/);
  });
});
