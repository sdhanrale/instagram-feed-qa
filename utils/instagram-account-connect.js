import { BASE_URL, INSTAGRAM_USERNAME, INSTAGRAM_PASSWORD } from '../config/test-config.js';

/**
 * Connect an Instagram account to the Smash Balloon Instagram Feed plugin.
 *
 * Goes through the full OAuth flow:
 * Settings → Add Source → Connect → Connect with Instagram → Login → Allow → Confirm domain → Save
 *
 * @param {import('@playwright/test').Page} page
 * @param {object} [options]
 * @param {string} [options.baseUrl]
 * @param {string} [options.instagramUsername] - Instagram username (from .env)
 * @param {string} [options.instagramPassword] - Instagram password (from .env)
 */
export async function connectInstagramAccount(page, options = {}) {
  const {
    baseUrl = BASE_URL,
    instagramUsername = INSTAGRAM_USERNAME,
    instagramPassword = INSTAGRAM_PASSWORD,
  } = options;

  if (!instagramUsername || !instagramPassword) {
    throw new Error(
      'Instagram credentials not found. Set INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD in your .env file.'
    );
  }

  console.log('Starting Instagram account connection...');
  console.log(`Using Instagram account: ${instagramUsername}`);

  // Step 1: Navigate to Instagram Feed Settings page
  console.log('Step 1: Navigating to Instagram Feed Settings...');
  await page.goto(`${baseUrl}/wp-admin/admin.php?page=sbi-settings`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ Navigated to Settings page');

  // Step 2: Click "Add Source"
  console.log('Step 2: Clicking Add Source...');
  await page.getByText('Add Source').click();
  await page.waitForTimeout(2000);
  console.log('✓ Clicked Add Source');

  // Step 3: Click "Connect" button
  console.log('Step 3: Clicking Connect button...');
  const connectBtn = page.getByRole('button', { name: 'Connect Connect' });
  await connectBtn.waitFor({ state: 'visible', timeout: 10000 });
  await connectBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ Clicked Connect button');

  // Step 4: Select connection type (Business Basic is default) and click Connect
  console.log('Step 4: Selecting connection type...');
  const connectionTypeConnect = page.getByRole('button', { name: 'Connect' }).last();
  await connectionTypeConnect.waitFor({ state: 'visible', timeout: 15000 });
  await connectionTypeConnect.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ Selected Business Basic connection type');

  // Step 5: Click "Connect with Instagram" if present, or skip if already on Instagram login
  console.log('Step 5: Clicking Connect with Instagram...');
  const connectWithIg = page.getByRole('button', { name: 'Connect with Instagram' });
  const igLoginField = page.getByRole('textbox', { name: /Phone number, username/i });
  const whichAppeared = await Promise.race([
    connectWithIg.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'connectButton'),
    igLoginField.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'igLogin'),
  ]);
  if (whichAppeared === 'connectButton') {
    await connectWithIg.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    console.log('✓ Clicked Connect with Instagram button');
  } else {
    console.log('✓ Already on Instagram login page (skipped Connect with Instagram)');
  }
  console.log('✓ Instagram OAuth page opened');

  // Step 6: Login to Instagram
  console.log('Step 6: Logging in to Instagram...');
  const usernameField = page.getByRole('textbox', { name: /Phone number, username/i });
  await usernameField.waitFor({ state: 'visible', timeout: 15000 });
  await usernameField.fill(instagramUsername);

  const passwordField = page.getByRole('textbox', { name: 'Password' });
  await passwordField.click();
  await passwordField.fill(instagramPassword);

  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  console.log('✓ Instagram credentials submitted');

  // Step 7: Handle "Save your login info?" prompt — click "Not now"
  console.log('Step 7: Handling login info prompt...');
  const notNowButton = page.getByRole('button', { name: 'Not now' });
  await notNowButton.waitFor({ state: 'visible', timeout: 15000 });
  await notNowButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ Clicked "Not now" on save login prompt');

  // Step 8: Allow the app access
  console.log('Step 8: Allowing app access...');
  const allowButton = page.getByRole('button', { name: 'Allow' });
  await allowButton.waitFor({ state: 'visible', timeout: 15000 });
  await allowButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  console.log('✓ Allowed app access');

  // Step 9: Confirm domain ownership — "Yes, it is my domain"
  console.log('Step 9: Confirming domain ownership...');
  const domainButton = page.getByRole('button', { name: 'Yes, it is my domain' });
  await domainButton.waitFor({ state: 'visible', timeout: 15000 });
  await domainButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('✓ Confirmed domain ownership');

  // Step 10: Save changes
  console.log('Step 10: Saving changes...');
  const saveButton = page.getByRole('button', { name: 'Save Changes' }).first();
  await saveButton.waitFor({ state: 'visible', timeout: 15000 });
  await saveButton.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ Changes saved');

  console.log('✓ Instagram account connected successfully!');
}
