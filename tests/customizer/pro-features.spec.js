import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../config/test-config.js';

test.describe('Customizer - Pro Feature Upsells', () => {
  test.setTimeout(300000); // 5 minutes

  test.beforeEach(async ({ page }) => {
    // Navigate directly to the feed customizer (auth from setup.spec.js storageState)
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should show upsell popup when clicking Carousel layout and verify Upgrade button opens correct URL', async ({ page }) => {
    console.log('=== Testing Carousel Layout Pro Upsell ===');

    // Open Feed Layout section
    const feedLayoutSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Feed Layout' });
    await feedLayoutSection.waitFor({ state: 'visible', timeout: 10000 });
    await feedLayoutSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Feed Layout section opened');

    // Click on Carousel layout option
    const carouselOption = page.locator('[data-layout="carousel"]');
    await carouselOption.waitFor({ state: 'visible', timeout: 10000 });
    await carouselOption.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Carousel layout');

    // Verify extensions popup appears
    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup is visible');

    // Verify popup heading mentions Feed Layouts
    const popupHeading = extensionPopup.locator('h4, .sb-popup-extension-heading, h3').first();
    const headingText = await popupHeading.textContent();
    console.log(`Popup heading: ${headingText}`);
    expect(headingText.toLowerCase()).toContain('layout');

    // Verify "Upgrade to Pro" button exists and has correct URL
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    console.log(`Upgrade URL: ${upgradeUrl}`);
    expect(upgradeUrl).toContain('smashballoon.com');
    console.log('✓ Upgrade to Pro button visible with correct URL');

    // Verify Upgrade button opens correct page (intercept navigation)
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Upgrade button opens Smash Balloon website');

    // Close popup
    const closeBtn = extensionPopup.locator('.sb-extensions-pp-cls, [data-dismiss], .sb-popup-close').first();
    if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }
    console.log('✓ Carousel layout pro upsell verified\n');
  });

  test('should show upsell popup when clicking Masonry layout and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Masonry Layout Pro Upsell ===');

    const feedLayoutSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Feed Layout' });
    await feedLayoutSection.waitFor({ state: 'visible', timeout: 10000 });
    await feedLayoutSection.click();
    await page.waitForTimeout(2000);

    const masonryOption = page.locator('[data-layout="masonry"]');
    await masonryOption.waitFor({ state: 'visible', timeout: 10000 });
    await masonryOption.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Masonry layout');

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup is visible');

    // Verify Upgrade button and click it
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    expect(upgradeUrl).toContain('smashballoon.com');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Masonry layout pro upsell verified\n');
  });

  test('should show upsell popup when clicking Highlight layout and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Highlight Layout Pro Upsell ===');

    const feedLayoutSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Feed Layout' });
    await feedLayoutSection.waitFor({ state: 'visible', timeout: 10000 });
    await feedLayoutSection.click();
    await page.waitForTimeout(2000);

    const highlightOption = page.locator('[data-layout="highlight"]');
    await highlightOption.waitFor({ state: 'visible', timeout: 10000 });
    await highlightOption.click();
    await page.waitForTimeout(2000);
    console.log('✓ Clicked Highlight layout');

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup is visible');

    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Highlight layout pro upsell verified\n');
  });

  test('should show pro upsell in Header section and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Header Section Pro Features ===');

    // Open Header section
    const headerSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Header' });
    await headerSection.waitFor({ state: 'visible', timeout: 10000 });
    await headerSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Header section opened');

    // Verify PRO label is visible in the sidebar
    const proLabel = page.locator('.sb-breadcrumb-pro-label, .sb-control-pro-label').first();
    if (await proLabel.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✓ PRO label visible in Header section');
    }

    // Look for dimmed/disabled controls (Stories, Followers)
    const dimmedOverlays = page.locator('.sb-control-elem-overlay');
    const overlayCount = await dimmedOverlays.count();
    console.log(`Found ${overlayCount} locked control overlays in Header section`);
    expect(overlayCount).toBeGreaterThan(0);

    // Click on a dimmed control to trigger popup
    await dimmedOverlays.first().click();
    await page.waitForTimeout(2000);

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup appeared for Header pro feature');

    // Verify Upgrade button and click it
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    expect(upgradeUrl).toContain('smashballoon.com');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Header section pro upsell verified\n');
  });

  test('should show pro upsell in Posts section and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Posts Section Pro Features ===');

    // Open Posts section
    const postsSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Posts' });
    await postsSection.waitFor({ state: 'visible', timeout: 10000 });
    await postsSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Posts section opened');

    // Look for dimmed/disabled controls (Captions, Likes/Comments, Hover)
    const dimmedOverlays = page.locator('.sb-control-elem-overlay');
    const overlayCount = await dimmedOverlays.count();
    console.log(`Found ${overlayCount} locked control overlays in Posts section`);
    expect(overlayCount).toBeGreaterThan(0);

    // Click on a dimmed control to trigger popup
    await dimmedOverlays.first().click();
    await page.waitForTimeout(2000);

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup appeared for Posts pro feature');

    // Verify Upgrade button and click it
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    expect(upgradeUrl).toContain('smashballoon.com');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Posts section pro upsell verified\n');
  });

  test('should show pro upsell for Lightbox section and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Lightbox Section Pro Upsell ===');

    // Open Lightbox section
    const lightboxSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Lightbox' });
    await lightboxSection.waitFor({ state: 'visible', timeout: 10000 });
    await lightboxSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Lightbox section opened');

    // Verify PRO label is visible
    const proLabel = page.locator('.sb-breadcrumb-pro-label');
    await expect(proLabel).toBeVisible({ timeout: 5000 });
    console.log('✓ PRO label visible in Lightbox section');

    // Verify "Learn More" or popup trigger link exists
    const learnMoreLink = page.locator('.sb-extpp-link, .sb-customizer-sidebar a').filter({ hasText: /learn more/i });
    if (await learnMoreLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await learnMoreLink.click();
      await page.waitForTimeout(2000);
      console.log('✓ Clicked Learn More link');
    } else {
      // Click on a locked control overlay
      const dimmedOverlay = page.locator('.sb-control-elem-overlay').first();
      if (await dimmedOverlay.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dimmedOverlay.click();
        await page.waitForTimeout(2000);
        console.log('✓ Clicked locked control overlay');
      }
    }

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup appeared for Lightbox');

    // Verify Upgrade button and click it
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    expect(upgradeUrl).toContain('smashballoon.com');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Lightbox section pro upsell verified\n');
  });

  test('should show pro upsell for Load More Infinite Scroll and verify Upgrade button', async ({ page }) => {
    console.log('=== Testing Load More Infinite Scroll Pro Upsell ===');

    // Open Load More Button section
    const loadMoreSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: /load more/i });
    await loadMoreSection.waitFor({ state: 'visible', timeout: 10000 });
    await loadMoreSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Load More Button section opened');

    // Look for dimmed/disabled controls (Infinite Scroll)
    const dimmedOverlays = page.locator('.sb-control-elem-overlay');
    const overlayCount = await dimmedOverlays.count();
    console.log(`Found ${overlayCount} locked control overlays in Load More section`);
    expect(overlayCount).toBeGreaterThan(0);

    // Click on the dimmed control
    await dimmedOverlays.first().click();
    await page.waitForTimeout(2000);

    const extensionPopup = page.locator('.sb-extensions-pp-ctn');
    await expect(extensionPopup).toBeVisible({ timeout: 10000 });
    console.log('✓ Extensions popup appeared for Infinite Scroll');

    // Verify Upgrade button and click it
    const upgradeButton = extensionPopup.getByRole('link', { name: /upgrade/i });
    await expect(upgradeButton).toBeVisible();
    const upgradeUrl = await upgradeButton.getAttribute('href');
    expect(upgradeUrl).toContain('smashballoon.com');

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      upgradeButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const openedUrl = newPage.url();
    console.log(`Upgrade button opened: ${openedUrl}`);
    expect(openedUrl).toContain('smashballoon.com');
    await newPage.close();
    console.log('✓ Load More Infinite Scroll pro upsell verified\n');
  });
});
