import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../config/test-config.js';

test.describe('Customizer - Pro Feature Upsells', () => {
  test.setTimeout(120000); // 2 minutes per test

  /**
   * Helper: verify the extensions popup appeared and the upgrade button works.
   * The popup uses class `.sbi-fb-extensions-pp-ctn` and the upgrade button is `.sbi-fb-extpp-get-btn`.
   */
  async function verifyUpgradePopup(page) {
    // Wait for popup container to be visible
    const popupContainer = page.locator('.sbi-fb-extensions-pp-ctn');
    await expect(popupContainer).toBeVisible({ timeout: 10000 });
    console.log('✓ Upgrade popup container visible');

    // Verify popup heading exists (h2 inside .sbi-fb-extpp-head)
    const heading = popupContainer.locator('.sbi-fb-extpp-head h2');
    await expect(heading).toBeVisible({ timeout: 5000 });
    const headingText = await heading.textContent();
    console.log(`Popup heading: ${headingText}`);

    // Verify the upgrade/get-pro button
    const upgradeBtn = popupContainer.locator('.sbi-fb-extpp-get-btn');
    await expect(upgradeBtn).toBeVisible({ timeout: 5000 });
    console.log('✓ Upgrade button visible');

    // Verify button links to smashballoon.com
    const href = await upgradeBtn.getAttribute('href');
    console.log(`Upgrade button URL: ${href}`);
    expect(href).toContain('smashballoon.com');

    // Click the upgrade button and verify it opens smashballoon.com in a new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeBtn.click(),
    ]);

    // Wait for external site to load (with timeout handling for slow external sites)
    try {
      await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
    } catch (e) {
      console.log('⚠ External site loading slowly, but continuing with URL verification');
    }

    const openedUrl = newPage.url();
    console.log(`Opened URL: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Upgrade button opens Smash Balloon website');
  }

  /**
   * Helper: navigate to customizer and open the Feed Layout section.
   */
  async function openFeedLayoutSection(page) {
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const feedLayoutSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Feed Layout' });
    await feedLayoutSection.waitFor({ state: 'visible', timeout: 10000 });
    await feedLayoutSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Feed Layout section opened');
  }

  /**
   * Helper: click a disabled layout toggle option by its label text.
   * Layout options are rendered as `.sb-control-toggle-elm` elements inside a toggleset.
   */
  async function clickLayoutOption(page, layoutName) {
    // The layout toggle elements contain the layout name as text
    const toggleElm = page.locator('.sb-control-toggle-elm').filter({ hasText: layoutName });
    await toggleElm.waitFor({ state: 'visible', timeout: 10000 });
    await toggleElm.click();
    await page.waitForTimeout(2000);
    console.log(`✓ Clicked ${layoutName} layout option`);
  }

  // ============================
  // TEST 1: Carousel Layout
  // ============================
  test('should show upsell popup when clicking Carousel layout', async ({ page }) => {
    console.log('=== Testing Carousel Layout Pro Upsell ===');
    await openFeedLayoutSection(page);
    await clickLayoutOption(page, 'Carousel');
    await verifyUpgradePopup(page);
    console.log('✓ Carousel layout pro upsell verified\n');
  });

  // ============================
  // TEST 2: Masonry Layout
  // ============================
  test('should show upsell popup when clicking Masonry layout', async ({ page }) => {
    console.log('=== Testing Masonry Layout Pro Upsell ===');
    await openFeedLayoutSection(page);
    await clickLayoutOption(page, 'Masonry');
    await verifyUpgradePopup(page);
    console.log('✓ Masonry layout pro upsell verified\n');
  });

  // ============================
  // TEST 3: Highlight Layout
  // ============================
  test('should show upsell popup when clicking Highlight layout', async ({ page }) => {
    console.log('=== Testing Highlight Layout Pro Upsell ===');
    await openFeedLayoutSection(page);
    await clickLayoutOption(page, 'Highlight');
    await verifyUpgradePopup(page);
    console.log('✓ Highlight layout pro upsell verified\n');
  });

  // ============================
  // TEST 4: Header Section Pro Features
  // ============================
  test('should show pro upsell in Header section', async ({ page }) => {
    console.log('=== Testing Header Section Pro Features ===');
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const headerSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Header' });
    await headerSection.waitFor({ state: 'visible', timeout: 10000 });
    await headerSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Header section opened');

    // Click the sidebar intro "Learn More" link (always triggers popup, not a URL redirect)
    const learnMore = page.locator('.sb-customizer-sidebar-intro a, .sb-customizer-sidebar a').getByText('Learn More').first();
    await learnMore.waitFor({ state: 'visible', timeout: 10000 });
    await learnMore.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Learn More');

    await verifyUpgradePopup(page);
    console.log('✓ Header section pro upsell verified\n');
  });

  // ============================
  // TEST 5: Posts Section Pro Features
  // ============================
  test('should show pro upsell in Posts section', async ({ page }) => {
    console.log('=== Testing Posts Section Pro Features ===');
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const postsSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Posts' });
    await postsSection.waitFor({ state: 'visible', timeout: 10000 });
    await postsSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Posts section opened');

    // Click the sidebar intro "Learn More" link
    const learnMore = page.getByText('Learn More').first();
    await learnMore.waitFor({ state: 'visible', timeout: 10000 });
    await learnMore.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Learn More');

    await verifyUpgradePopup(page);
    console.log('✓ Posts section pro upsell verified\n');
  });

  // ============================
  // TEST 6: Lightbox Section Pro Upsell
  // ============================
  test('should show pro upsell for Lightbox section', async ({ page }) => {
    console.log('=== Testing Lightbox Section Pro Upsell ===');
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const lightboxSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Lightbox' });
    await lightboxSection.waitFor({ state: 'visible', timeout: 10000 });
    await lightboxSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Lightbox section opened');

    // Click "Learn More"
    const learnMore = page.getByText('Learn More').first();
    await learnMore.waitFor({ state: 'visible', timeout: 10000 });
    await learnMore.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Learn More');

    await verifyUpgradePopup(page);
    console.log('✓ Lightbox section pro upsell verified\n');
  });

  // ============================
  // TEST 7: Load More Button - Pro Features
  // ============================
  test('should show pro upsell for Load More section', async ({ page }) => {
    console.log('=== Testing Load More Section Pro Upsell ===');
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const loadMoreSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: /load more/i });
    await loadMoreSection.waitFor({ state: 'visible', timeout: 10000 });
    await loadMoreSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Load More Button section opened');

    // The Load More section has a control overlay that triggers the popup when clicked
    // Try clicking the overlay element first, fall back to "Learn More" link
    const overlay = page.locator('.sb-control-elem-overlay:visible').first();
    const learnMore = page.getByText('Learn More').first();

    // Check which element is available
    const overlayVisible = await overlay.isVisible().catch(() => false);
    if (overlayVisible) {
      await overlay.click();
      console.log('✓ Clicked control overlay');
    } else {
      await learnMore.waitFor({ state: 'visible', timeout: 10000 });
      await learnMore.click();
      console.log('✓ Clicked Learn More');
    }
    await page.waitForTimeout(2000);

    // Check if popup appeared or if it navigated to smashballoon.com
    const popupVisible = await page.locator('.sbi-fb-extensions-pp-ctn').isVisible().catch(() => false);
    if (popupVisible) {
      await verifyUpgradePopup(page);
    } else {
      // Some "Learn More" links navigate directly to smashballoon.com (via utmLink)
      // In that case, check if a new tab opened
      const pages = page.context().pages();
      const smashBalloonPage = pages.find(p => p.url().includes('smashballoon.com'));
      if (smashBalloonPage) {
        console.log(`✓ Learn More opened Smash Balloon website: ${smashBalloonPage.url()}`);
        expect(smashBalloonPage.url()).toContain('smashballoon.com');
        await smashBalloonPage.close();
      } else {
        // Check current page URL
        const currentUrl = page.url();
        console.log(`Current URL after click: ${currentUrl}`);
        expect(currentUrl).toContain('smashballoon.com');
      }
    }
    console.log('✓ Load More section pro upsell verified\n');
  });
});
