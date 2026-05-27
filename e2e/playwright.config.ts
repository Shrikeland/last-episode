import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

// In this cloud environment, browsers are pre-installed at /opt/pw-browsers
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && require('fs').existsSync('/opt/pw-browsers')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers'
}

const BASE_URL = process.env.BASE_URL || 'https://www.episode.watch'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      // disabled by default — enable explicitly: --project=firefox
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // disabled by default — enable explicitly: --project=webkit
    },
  ],
})
