// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,

  expect: {
    timeout: 10_000,
  },

  fullyParallel: false,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 1 : 0,

  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL: process.env.WP_BASE_URL || 'http://insta-feed-auto.local',

    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',

    navigationTimeout: 15_000,

    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests\/customizer\/.*/,
    },
    {
      name: 'customizer-setup',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /tests\/customizer\/setup\.spec\.js/,
    },
    {
      name: 'customizer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/storage-state.json',
      },
      testMatch: /tests\/customizer\/(?!setup).*\.spec\.js/,
      dependencies: ['customizer-setup'],
    },
  ],

  outputDir: './test-results',
});
