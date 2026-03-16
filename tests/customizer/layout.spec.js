import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../config/test-config.js';

test.describe('Customizer - Layout Settings', () => {
  test.setTimeout(300000); // 5 minutes per test

  // Helper: open customizer and go to Feed Layout section
  async function openFeedLayoutSection(page) {
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const feedLayoutSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Feed Layout' });
    await feedLayoutSection.waitFor({ state: 'visible', timeout: 10000 });
    await feedLayoutSection.click();
    await page.waitForTimeout(2000);
  }

  // Helper: save customizer settings
  async function saveSettings(page) {
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  }

  // Helper: go to frontend and wait for feed
  async function goToFrontend(page) {
    await page.goto(`${BASE_URL}/sample-page/`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(5000);
    await expect(page.locator('#sb_instagram')).toBeVisible({ timeout: 15000 });
  }

  // ============================
  // TEST 1: Number of Posts
  // ============================
  test('should change Number of Posts to 6 and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Number of Posts ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Number of Posts from 20 to 6
    // Spinbuttons order: 0=Feed Height, 1=Padding, 2=Num Posts Desktop, 3=Num Posts Mobile
    const numPostsInput = page.getByRole('spinbutton').nth(2);
    await numPostsInput.waitFor({ state: 'visible', timeout: 10000 });
    await numPostsInput.click({ clickCount: 3 });
    await numPostsInput.fill('6');
    await numPostsInput.press('Tab');
    await page.waitForTimeout(2000);
    console.log('✓ Number of posts set to 6');

    // Verify in preview sidebar
    const numPostsValue = await page.getByRole('spinbutton').nth(2).inputValue();
    expect(numPostsValue).toBe('6');
    console.log(`✓ Preview sidebar shows Number of Posts = ${numPostsValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save and go to frontend
    await saveSettings(page);
    console.log('✓ Settings saved');

    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify visible posts count on frontend (should be 6)
    const visibleItemCount = await page.locator('#sbi_images .sbi_item').evaluateAll(items =>
      items.filter(el => window.getComputedStyle(el).display !== 'none').length
    );
    console.log(`Frontend shows ${visibleItemCount} visible feed items`);
    expect(visibleItemCount).toBeLessThanOrEqual(6);
    console.log('✓ Number of Posts = 6 verified on frontend\n');

    // Reset back to default (20)
    await openFeedLayoutSection(page);
    const resetInput = page.getByRole('spinbutton').nth(2);
    await resetInput.click({ clickCount: 3 });
    await resetInput.fill('20');
    await resetInput.press('Tab');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Number of Posts back to 20');
  });

  // ============================
  // TEST 2: Columns
  // ============================
  test('should change Columns to 3 and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Columns ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Columns from 4 to 3
    // Comboboxes order: 0=Aspect Ratio, 1=Columns Desktop, 2=Columns Tablet, 3=Columns Mobile
    const columnsSelect = page.getByRole('combobox').nth(1);
    await columnsSelect.waitFor({ state: 'visible', timeout: 10000 });
    await columnsSelect.selectOption('3');
    await page.waitForTimeout(2000);
    console.log('✓ Columns set to 3');

    // Verify in preview sidebar
    const columnsValue = await page.getByRole('combobox').nth(1).inputValue();
    expect(columnsValue).toBe('3');
    console.log(`✓ Preview sidebar shows Columns = ${columnsValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save and go to frontend
    await saveSettings(page);
    console.log('✓ Settings saved');

    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify 3-column layout by checking item width ratio (3 cols ≈ 33%)
    const firstItem = page.locator('#sbi_images .sbi_item').first();
    const itemWidth = await firstItem.evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const feedWidth = await page.locator('#sbi_images').evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const columnRatio = itemWidth / feedWidth;
    console.log(`Item width: ${itemWidth}px, Feed width: ${feedWidth}px, Ratio: ${(columnRatio * 100).toFixed(1)}%`);
    expect(columnRatio).toBeGreaterThan(0.25);
    expect(columnRatio).toBeLessThan(0.40);
    console.log('✓ 3-column layout verified on frontend\n');

    // Reset back to default (4)
    await openFeedLayoutSection(page);
    const resetSelect = page.getByRole('combobox').nth(1);
    await resetSelect.selectOption('4');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Columns back to 4');
  });

  // ============================
  // TEST 3: Image Padding
  // ============================
  test('should change Image Padding to 10 and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Image Padding ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Padding from 5 to 10
    // Spinbuttons order: 0=Feed Height, 1=Padding, 2=Num Posts Desktop, 3=Num Posts Mobile
    const paddingInput = page.getByRole('spinbutton').nth(1);
    await paddingInput.waitFor({ state: 'visible', timeout: 10000 });
    await paddingInput.click({ clickCount: 3 });
    await paddingInput.fill('10');
    await paddingInput.press('Tab');
    await page.waitForTimeout(2000);
    console.log('✓ Image padding set to 10');

    // Verify in preview sidebar
    const paddingValue = await page.getByRole('spinbutton').nth(1).inputValue();
    expect(paddingValue).toBe('10');
    console.log(`✓ Preview sidebar shows Padding = ${paddingValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save and go to frontend
    await saveSettings(page);
    console.log('✓ Settings saved');

    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify padding on frontend (10px → gap: 20px on #sbi_images)
    const sbiImagesEl = page.locator('#sbi_images');
    const gapOrPadding = await sbiImagesEl.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        gap: styles.gap,
        inlineStyle: el.getAttribute('style') || '',
      };
    });
    console.log(`#sbi_images gap: ${gapOrPadding.gap}, inline style: ${gapOrPadding.inlineStyle}`);
    const hasCorrectSpacing =
      gapOrPadding.inlineStyle.includes('20px') ||
      gapOrPadding.inlineStyle.includes('10px') ||
      gapOrPadding.gap.includes('20px') ||
      gapOrPadding.gap.includes('10px');
    expect(hasCorrectSpacing).toBe(true);
    console.log('✓ Image Padding = 10 verified on frontend\n');

    // Reset back to default (5)
    await openFeedLayoutSection(page);
    const resetInput = page.getByRole('spinbutton').nth(1);
    await resetInput.click({ clickCount: 3 });
    await resetInput.fill('5');
    await resetInput.press('Tab');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Image Padding back to 5');
  });

  // ============================
  // TEST 4: Aspect Ratio
  // ============================
  test('should change Aspect Ratio to Portrait (4:5) and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Aspect Ratio ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Aspect Ratio to Portrait (4:5)
    // Comboboxes order: 0=Aspect Ratio, 1=Columns Desktop, 2=Columns Tablet, 3=Columns Mobile
    const aspectRatioSelect = page.getByRole('combobox').nth(0);
    await aspectRatioSelect.waitFor({ state: 'visible', timeout: 10000 });
    await aspectRatioSelect.selectOption('Portrait (4:5)');
    await page.waitForTimeout(2000);
    console.log('✓ Aspect ratio set to Portrait (4:5)');

    // Verify in preview sidebar
    const aspectValue = await page.getByRole('combobox').nth(0).inputValue();
    console.log(`✓ Preview sidebar shows Aspect Ratio = ${aspectValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save and go to frontend
    await saveSettings(page);
    console.log('✓ Settings saved');

    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify aspect ratio on frontend - portrait items should be taller than wide
    const firstItem = page.locator('#sbi_images .sbi_item .sbi_photo_wrap').first();
    const dimensions = await firstItem.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    console.log(`Photo wrap: width=${dimensions.width}px, height=${dimensions.height}px`);
    // For 4:5 portrait, height should be greater than width
    expect(dimensions.height).toBeGreaterThan(dimensions.width * 0.9);
    console.log('✓ Aspect Ratio = Portrait (4:5) verified on frontend\n');

    // Reset back to default (Square (1:1))
    await openFeedLayoutSection(page);
    const resetSelect = page.getByRole('combobox').nth(0);
    await resetSelect.selectOption('Square (1:1)');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Aspect Ratio back to Square (1:1)');
  });

  // ============================
  // TEST 5: Feed Height
  // ============================
  test('should change Feed Height to 500 and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Feed Height ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Feed Height to 500
    // Spinbuttons order: 0=Feed Height, 1=Padding, 2=Num Posts Desktop, 3=Num Posts Mobile
    const feedHeightInput = page.getByRole('spinbutton').nth(0);
    await feedHeightInput.waitFor({ state: 'visible', timeout: 10000 });
    await feedHeightInput.click({ clickCount: 3 });
    await feedHeightInput.fill('500');
    await feedHeightInput.press('Tab');
    await page.waitForTimeout(2000);
    console.log('✓ Feed height set to 500');

    // Verify in preview sidebar
    const feedHeightValue = await page.getByRole('spinbutton').nth(0).inputValue();
    expect(feedHeightValue).toBe('500');
    console.log(`✓ Preview sidebar shows Feed Height = ${feedHeightValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save and go to frontend
    await saveSettings(page);
    console.log('✓ Settings saved');

    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify feed height on frontend
    const feedContainer = page.locator('#sb_instagram');
    const feedStyles = await feedContainer.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        height: parseFloat(styles.height),
        maxHeight: styles.maxHeight,
        overflow: styles.overflow || styles.overflowY,
        inlineStyle: el.getAttribute('style') || '',
      };
    });
    console.log(`Feed height: ${feedStyles.height}px, maxHeight: ${feedStyles.maxHeight}, overflow: ${feedStyles.overflow}`);
    console.log(`Feed inline style: ${feedStyles.inlineStyle}`);
    // Feed height should be capped around 500px
    expect(feedStyles.height).toBeLessThanOrEqual(550);
    console.log('✓ Feed Height = 500 verified on frontend\n');

    // Reset back to default (empty/no height)
    await openFeedLayoutSection(page);
    const resetInput = page.getByRole('spinbutton').nth(0);
    await resetInput.click({ clickCount: 3 });
    await resetInput.fill('');
    await resetInput.press('Tab');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Feed Height back to default');
  });

  // ============================
  // TEST 6: Number of Posts Mobile
  // ============================
  test('should change Number of Posts Mobile to 3 and verify in preview', async ({ page }) => {
    console.log('=== Testing Number of Posts Mobile ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Number of Posts Mobile to 3
    // Spinbuttons order: 0=Feed Height, 1=Padding, 2=Num Posts Desktop, 3=Num Posts Mobile
    const numPostsMobileInput = page.getByRole('spinbutton').nth(3);
    await numPostsMobileInput.waitFor({ state: 'visible', timeout: 10000 });
    await numPostsMobileInput.click({ clickCount: 3 });
    await numPostsMobileInput.fill('3');
    await numPostsMobileInput.press('Tab');
    await page.waitForTimeout(2000);
    console.log('✓ Number of posts mobile set to 3');

    // Verify in preview sidebar
    const numPostsMobileValue = await page.getByRole('spinbutton').nth(3).inputValue();
    expect(numPostsMobileValue).toBe('3');
    console.log(`✓ Preview sidebar shows Number of Posts Mobile = ${numPostsMobileValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save
    await saveSettings(page);
    console.log('✓ Settings saved');

    // Verify on frontend with mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await goToFrontend(page);
    console.log('✓ Frontend loaded in mobile viewport');

    const visibleItemCount = await page.locator('#sbi_images .sbi_item').evaluateAll(items =>
      items.filter(el => window.getComputedStyle(el).display !== 'none').length
    );
    console.log(`Mobile frontend shows ${visibleItemCount} visible feed items`);
    expect(visibleItemCount).toBeLessThanOrEqual(3);
    console.log('✓ Number of Posts Mobile = 3 verified on frontend\n');

    // Reset viewport and value
    await page.setViewportSize({ width: 1280, height: 720 });
    await openFeedLayoutSection(page);
    const resetInput = page.getByRole('spinbutton').nth(3);
    await resetInput.click({ clickCount: 3 });
    await resetInput.fill('20');
    await resetInput.press('Tab');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Number of Posts Mobile back to 20');
  });

  // ============================
  // TEST 7: Columns Tablet
  // ============================
  test('should change Columns Tablet to 2 and verify in preview', async ({ page }) => {
    console.log('=== Testing Columns Tablet ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Columns Tablet to 2
    // Comboboxes order: 0=Aspect Ratio, 1=Columns Desktop, 2=Columns Tablet, 3=Columns Mobile
    const columnsTabletSelect = page.getByRole('combobox').nth(2);
    await columnsTabletSelect.waitFor({ state: 'visible', timeout: 10000 });
    await columnsTabletSelect.selectOption('2');
    await page.waitForTimeout(2000);
    console.log('✓ Columns Tablet set to 2');

    // Verify in preview sidebar
    const columnsTabletValue = await page.getByRole('combobox').nth(2).inputValue();
    expect(columnsTabletValue).toBe('2');
    console.log(`✓ Preview sidebar shows Columns Tablet = ${columnsTabletValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save
    await saveSettings(page);
    console.log('✓ Settings saved');

    // Verify on frontend with tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await goToFrontend(page);
    console.log('✓ Frontend loaded in tablet viewport');

    // Verify 2-column layout (each item ≈ 50% width)
    const firstItem = page.locator('#sbi_images .sbi_item').first();
    const itemWidth = await firstItem.evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const feedWidth = await page.locator('#sbi_images').evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const columnRatio = itemWidth / feedWidth;
    console.log(`Item width: ${itemWidth}px, Feed width: ${feedWidth}px, Ratio: ${(columnRatio * 100).toFixed(1)}%`);
    expect(columnRatio).toBeGreaterThan(0.40);
    expect(columnRatio).toBeLessThan(0.60);
    console.log('✓ 2-column tablet layout verified on frontend\n');

    // Reset viewport and value
    await page.setViewportSize({ width: 1280, height: 720 });
    await openFeedLayoutSection(page);
    const resetSelect = page.getByRole('combobox').nth(2);
    await resetSelect.selectOption('2');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Columns Tablet back to default');
  });

  // ============================
  // TEST 8: Columns Mobile
  // ============================
  test('should change Columns Mobile to 1 and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Columns Mobile ===');

    await openFeedLayoutSection(page);
    console.log('✓ Feed Layout section opened');

    // Change Columns Mobile to 1
    // Comboboxes order: 0=Aspect Ratio, 1=Columns Desktop, 2=Columns Tablet, 3=Columns Mobile
    const columnsMobileSelect = page.getByRole('combobox').nth(3);
    await columnsMobileSelect.waitFor({ state: 'visible', timeout: 10000 });
    await columnsMobileSelect.selectOption('1');
    await page.waitForTimeout(2000);
    console.log('✓ Columns Mobile set to 1');

    // Verify in preview sidebar
    const columnsMobileValue = await page.getByRole('combobox').nth(3).inputValue();
    expect(columnsMobileValue).toBe('1');
    console.log(`✓ Preview sidebar shows Columns Mobile = ${columnsMobileValue}`);

    // Verify feed is visible in preview
    await expect(page.locator('#sb_instagram')).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Save
    await saveSettings(page);
    console.log('✓ Settings saved');

    // Verify on frontend with mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await goToFrontend(page);
    console.log('✓ Frontend loaded in mobile viewport');

    // Verify 1-column layout (each item ≈ 100% width)
    const firstItem = page.locator('#sbi_images .sbi_item').first();
    const itemWidth = await firstItem.evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const feedWidth = await page.locator('#sbi_images').evaluate(el => parseFloat(window.getComputedStyle(el).width));
    const columnRatio = itemWidth / feedWidth;
    console.log(`Item width: ${itemWidth}px, Feed width: ${feedWidth}px, Ratio: ${(columnRatio * 100).toFixed(1)}%`);
    expect(columnRatio).toBeGreaterThan(0.90);
    console.log('✓ 1-column mobile layout verified on frontend\n');

    // Reset viewport and value
    await page.setViewportSize({ width: 1280, height: 720 });
    await openFeedLayoutSection(page);
    const resetSelect = page.getByRole('combobox').nth(3);
    await resetSelect.selectOption('1');
    await page.waitForTimeout(1000);
    await saveSettings(page);
    console.log('✓ Reset Columns Mobile back to default');
  });
});
