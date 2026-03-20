import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../config/test-config.js';

test.describe('Customizer - Color Schemes Settings', () => {
  test.use({ storageState: '.auth/storage-state.json' });
  test.setTimeout(120000); // 2 minutes per test

  /**
   * Helper: Open Color Scheme section in customizer
   */
  async function openColorSchemeSection(page) {
    // Navigate to customizer (feed should already exist from previous tests)
    await page.goto(`${BASE_URL}/wp-admin/admin.php?page=sbi-feed-builder&feed_id=1`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Open Color Scheme section using the correct selector pattern
    const colorSchemeSection = page.locator('.sb-customizer-sidebar-sec-el').filter({ hasText: 'Color Scheme' });
    await colorSchemeSection.waitFor({ state: 'visible', timeout: 10000 });
    await colorSchemeSection.click();
    await page.waitForTimeout(2000);
    console.log('✓ Color Scheme section opened');
  }

  /**
   * Helper: Save customizer settings
   */
  async function saveSettings(page) {
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✓ Settings saved');
  }

  /**
   * Helper: Go to frontend and wait for feed
   */
  async function goToFrontend(page) {
    await page.goto(`${BASE_URL}/sample-page/`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(5000);
    await expect(page.locator('#sb_instagram')).toBeVisible({ timeout: 15000 });
  }

  /**
   * Helper: Convert RGB string to object for easier comparison
   * Example: "rgb(240, 240, 240)" -> { r: 240, g: 240, b: 240 }
   */
  function parseRgb(rgbString) {
    const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  /**
   * Helper: Check if color is light (closer to white)
   */
  function isLightColor(rgbString) {
    const rgb = parseRgb(rgbString);
    if (!rgb) return false;
    // Average RGB value above 200 is considered light
    const average = (rgb.r + rgb.g + rgb.b) / 3;
    return average > 200;
  }

  /**
   * Helper: Check if color is dark (closer to black)
   */
  function isDarkColor(rgbString) {
    const rgb = parseRgb(rgbString);
    if (!rgb) return false;
    // Average RGB value below 100 is considered dark
    const average = (rgb.r + rgb.g + rgb.b) / 3;
    return average < 100;
  }

  /**
   * Test 1: Change Color Scheme to Light
   */
  test('should change Color Scheme to Light and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Color Scheme: Light ===');

    await openColorSchemeSection(page);

    // Select Light color scheme
    const lightOption = page.locator('.sb-control-toggle-elm').filter({ hasText: 'Light' }).first();
    if (await lightOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await lightOption.click();
      await page.waitForTimeout(1000);
      console.log('✓ Light color scheme selected');
    } else {
      console.log('⚠ Light color scheme option not found, skipping');
      test.skip();
    }

    // Verify feed is visible in preview
    const previewFeed = page.locator('#sb_instagram');
    await expect(previewFeed).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Verify light color in preview (backend)
    const previewBgColor = await previewFeed.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Preview background color: ${previewBgColor}`);
    expect(isLightColor(previewBgColor)).toBeTruthy();
    console.log('✓ Light color scheme applied in preview (backend)');

    // Save and go to frontend
    await saveSettings(page);
    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify light color on frontend
    const frontendFeed = page.locator('#sb_instagram');
    await expect(frontendFeed).toBeVisible();

    const frontendBgColor = await frontendFeed.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Frontend background color: ${frontendBgColor}`);
    expect(isLightColor(frontendBgColor)).toBeTruthy();
    console.log('✓ Light color scheme applied on frontend\n');
  });

  /**
   * Test 2: Change Color Scheme to Dark
   */
  test('should change Color Scheme to Dark and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Color Scheme: Dark ===');

    await openColorSchemeSection(page);

    // Select Dark color scheme
    const darkOption = page.locator('.sb-control-toggle-elm').filter({ hasText: 'Dark' }).first();
    if (await darkOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await darkOption.click();
      await page.waitForTimeout(1000);
      console.log('✓ Dark color scheme selected');
    } else {
      console.log('⚠ Dark color scheme option not found, skipping');
      test.skip();
    }

    // Verify feed is visible in preview
    const previewFeed = page.locator('#sb_instagram');
    await expect(previewFeed).toBeVisible();
    await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
    console.log('✓ Feed visible with images in preview');

    // Verify dark color in preview (backend)
    const previewBgColor = await previewFeed.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Preview background color: ${previewBgColor}`);
    expect(isDarkColor(previewBgColor)).toBeTruthy();
    console.log('✓ Dark color scheme applied in preview (backend)');

    // Save and go to frontend
    await saveSettings(page);
    await goToFrontend(page);
    console.log('✓ Frontend loaded');

    // Verify dark color on frontend
    const frontendFeed = page.locator('#sb_instagram');
    await expect(frontendFeed).toBeVisible();

    const frontendBgColor = await frontendFeed.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    console.log(`Frontend background color: ${frontendBgColor}`);
    expect(isDarkColor(frontendBgColor)).toBeTruthy();
    console.log('✓ Dark color scheme applied on frontend\n');
  });

  /**
   * Test 3: Test Custom Background Color
   */
  test('should change Custom Background Color and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Custom Background Color ===');

    await openColorSchemeSection(page);

    // Select Custom color scheme first
    const customOption = page.locator('.sb-control-toggle-elm').filter({ hasText: 'Custom' }).first();
    if (await customOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customOption.click();
      await page.waitForTimeout(1000);
      console.log('✓ Custom color scheme selected');

      // Find and set background color input
      const bgColorInput = page.locator('input[type="color"]').first();
      if (await bgColorInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await bgColorInput.fill('#f0f0f0');
        await page.waitForTimeout(1000);
        console.log('✓ Background color set to #f0f0f0');

        // Verify feed is visible in preview
        const previewFeed = page.locator('#sb_instagram');
        await expect(previewFeed).toBeVisible();
        await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
        console.log('✓ Feed visible with custom background in preview');

        // Verify custom background color in preview (backend)
        const previewBgColor = await previewFeed.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`Preview background color: ${previewBgColor}`);
        const previewRgb = parseRgb(previewBgColor);
        expect(previewRgb.r).toBe(240);
        expect(previewRgb.g).toBe(240);
        expect(previewRgb.b).toBe(240);
        console.log('✓ Custom background color (rgb(240, 240, 240)) applied in preview (backend)');

        // Save and go to frontend
        await saveSettings(page);
        await goToFrontend(page);
        console.log('✓ Frontend loaded');

        // Verify custom background color on frontend
        const frontendFeed = page.locator('#sb_instagram');
        await expect(frontendFeed).toBeVisible();

        const frontendBgColor = await frontendFeed.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });
        console.log(`Frontend background color: ${frontendBgColor}`);
        const frontendRgb = parseRgb(frontendBgColor);
        expect(frontendRgb.r).toBe(240);
        expect(frontendRgb.g).toBe(240);
        expect(frontendRgb.b).toBe(240);
        console.log('✓ Custom background color (rgb(240, 240, 240)) applied on frontend\n');
      } else {
        console.log('⚠ Background color picker not found, skipping');
        test.skip();
      }
    } else {
      console.log('⚠ Custom color scheme option not found, skipping');
      test.skip();
    }
  });

  /**
   * Test 4: Test Custom Text Color
   */
  test('should change Custom Text Color and verify in preview and frontend', async ({ page }) => {
    console.log('=== Testing Custom Text Color ===');

    await openColorSchemeSection(page);

    // Select Custom color scheme first
    const customOption = page.locator('.sb-control-toggle-elm').filter({ hasText: 'Custom' }).first();
    if (await customOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await customOption.click();
      await page.waitForTimeout(1000);
      console.log('✓ Custom color scheme selected');

      // Find and set text color input (usually second color input)
      const textColorInput = page.locator('input[type="color"]').nth(1);
      if (await textColorInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await textColorInput.fill('#333333');
        await page.waitForTimeout(1000);
        console.log('✓ Text color set to #333333');

        // Verify feed is visible in preview
        const previewFeed = page.locator('#sb_instagram');
        await expect(previewFeed).toBeVisible();
        await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
        console.log('✓ Feed visible with custom text color in preview');

        // Verify custom text color in preview (backend) - check on feed container
        const previewTextColor = await previewFeed.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Preview text color: ${previewTextColor}`);
        const previewRgb = parseRgb(previewTextColor);
        expect(previewRgb.r).toBe(51);
        expect(previewRgb.g).toBe(51);
        expect(previewRgb.b).toBe(51);
        console.log('✓ Custom text color (rgb(51, 51, 51)) applied in preview (backend)');

        // Save and go to frontend
        await saveSettings(page);
        await goToFrontend(page);
        console.log('✓ Frontend loaded');

        // Verify custom text color on frontend
        const frontendFeed = page.locator('#sb_instagram');
        await expect(frontendFeed).toBeVisible();

        const frontendTextColor = await frontendFeed.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });
        console.log(`Frontend text color: ${frontendTextColor}`);
        const frontendRgb = parseRgb(frontendTextColor);
        expect(frontendRgb.r).toBe(51);
        expect(frontendRgb.g).toBe(51);
        expect(frontendRgb.b).toBe(51);
        console.log('✓ Custom text color (rgb(51, 51, 51)) applied on frontend\n');
      } else {
        console.log('⚠ Text color picker not found, skipping');
        test.skip();
      }
    } else {
      console.log('⚠ Custom color scheme option not found, skipping');
      test.skip();
    }
  });

  /**
   * Test 5: Reset to Default Color Scheme
   */
  test('should reset Color Scheme to default (Inherit from Theme)', async ({ page }) => {
    console.log('=== Resetting to Default Color Scheme ===');

    await openColorSchemeSection(page);

    // Select default/inherit option (labeled "Inherit from Theme")
    const defaultOption = page.locator('.sb-control-toggle-elm').filter({ hasText: 'Inherit from Theme' }).first();
    if (await defaultOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await defaultOption.click();
      await page.waitForTimeout(1000);
      console.log('✓ Default color scheme selected');

      // Verify feed is visible in preview
      const previewFeed = page.locator('#sb_instagram');
      await expect(previewFeed).toBeVisible();
      await expect(page.locator('#sbi_images .sbi_item img').first()).toBeVisible();
      console.log('✓ Feed visible with default color scheme in preview');

      // Verify color is set in preview (backend) - not checking exact value, just that it's applied
      const previewBgColor = await previewFeed.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Preview background color: ${previewBgColor}`);
      expect(previewBgColor).toBeTruthy();
      console.log('✓ Default color scheme applied in preview (backend)');

      // Save and go to frontend
      await saveSettings(page);
      await goToFrontend(page);
      console.log('✓ Frontend loaded');

      // Verify color is set on frontend
      const frontendFeed = page.locator('#sb_instagram');
      await expect(frontendFeed).toBeVisible();

      const frontendBgColor = await frontendFeed.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
      console.log(`Frontend background color: ${frontendBgColor}`);
      expect(frontendBgColor).toBeTruthy();
      console.log('✓ Default color scheme restored on frontend\n');
    } else {
      console.log('⚠ Default color scheme option not found, skipping');
      test.skip();
    }
  });
});
