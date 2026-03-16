import { expect } from '@playwright/test';
import { BASE_URL } from '../config/test-config.js';

/**
 * Run through the Instagram Feed (Smash Balloon) onboarding setup wizard.
 *
 * Assumes the plugin is already installed, activated, and the user is logged in.
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 */
export async function runSetupWizard(page, options = {}) {
  const { baseUrl = BASE_URL } = options;

  console.log('Starting Instagram Feed setup wizard...');

  // Navigate to the Instagram Feed setup page
  await page.goto(`${baseUrl}/wp-admin/admin.php?page=sbi-setup`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Step 1: Dismiss any review/notice banners if visible
  const dismissLink = page.getByRole('link', { name: 'Dismiss' });
  if (await dismissLink.isVisible().catch(() => false)) {
    await dismissLink.click();
    await page.waitForTimeout(1000);
    console.log('✓ Dismissed notice banner');
  }

  // Step 2: Click "Launch the Setup Wizard"
  console.log('Step 1: Launching the Setup Wizard...');
  const launchButton = page.getByRole('button', { name: 'Launch the Setup Wizard' });
  await launchButton.waitFor({ state: 'visible', timeout: 10000 });
  await launchButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ Setup Wizard launched');

  // Step 3: Skip the "Connect Your Instagram Account" step
  console.log('Step 2: Skipping Instagram account connection...');
  const skipButton = page.getByRole('button', { name: 'Skip this step' });
  await skipButton.waitFor({ state: 'visible', timeout: 10000 });
  await skipButton.click();
  await page.waitForTimeout(2000);
  console.log('✓ Skipped Instagram account connection');

  // Step 4: Select feed customization options (toggles)
  console.log('Step 3: Selecting feed customization options...');
  const toggle4 = page.locator('div:nth-child(4) > .sb-onboarding-wizard-elem-toggle > div').first();
  await toggle4.waitFor({ state: 'visible', timeout: 10000 });
  await toggle4.click();
  await page.waitForTimeout(500);

  const toggle5 = page.locator('div:nth-child(5) > .sb-onboarding-wizard-elem-toggle > div');
  await toggle5.click();
  await page.waitForTimeout(500);
  console.log('✓ Selected customization options');

  // Step 5: Click Next
  console.log('Step 4: Proceeding to next step...');
  const nextButton = page.getByRole('button', { name: 'Next' });
  await nextButton.click();
  await page.waitForTimeout(2000);
  console.log('✓ Moved to next step');

  // Step 6: Select recommended plugins toggle
  console.log('Step 5: Selecting recommended plugins...');
  const pluginToggle = page.locator('.sb-onboarding-wizard-elem-toggle > div');
  await pluginToggle.waitFor({ state: 'visible', timeout: 10000 });
  await pluginToggle.click();
  await page.waitForTimeout(500);
  console.log('✓ Selected recommended plugins toggle');

  // Step 7: Install selected plugins
  console.log('Step 6: Installing selected plugins...');
  const installPluginsButton = page.getByRole('button', { name: 'Install Selected Plugins' });
  await installPluginsButton.waitFor({ state: 'visible', timeout: 10000 });
  await installPluginsButton.click();
  await page.waitForTimeout(5000);
  console.log('✓ Installed selected plugins');

  // Step 8: Complete setup without connecting
  console.log('Step 7: Completing setup...');
  const completeButton = page.getByRole('button', { name: 'Complete Setup Without' });
  await completeButton.waitFor({ state: 'visible', timeout: 15000 });
  await completeButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ Setup wizard completed successfully!');
}
