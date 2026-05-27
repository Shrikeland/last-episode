import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env') })

// In this cloud environment, browsers are pre-installed at /opt/pw-browsers
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && require('fs').existsSync('/opt/pw-browsers')) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers'
}

const BASE_URL = process.env.BASE_URL || 'https://www.episode.watch'
const isLocal = BASE_URL.startsWith('http://localhost') || BASE_URL.startsWith('http://127.0.0.1')

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  // When BASE_URL points to localhost, Playwright starts Next.js automatically.
  // reuseExistingServer: true — reuses whatever is already running on that port.
  webServer: isLocal
    ? {
        command: 'npm run dev',
        url: BASE_URL,
        reuseExistingServer: true,
        cwd: path.resolve(__dirname, '..'),
        timeout: 120_000,
      }
    : undefined,

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
