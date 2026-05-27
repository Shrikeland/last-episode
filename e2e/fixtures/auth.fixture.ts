import { test as base, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { isBaseUrlReachable } from '@/support/network'

const STORAGE_STATE_PATH = path.join(__dirname, '../support/auth.storage.json')

async function performLogin(page: Page, email: string, password: string) {
  await page.goto('/login', { waitUntil: 'networkidle' })
  await page.getByTestId('login-email-input').fill(email)
  await page.getByTestId('login-password-input').fill(password)
  await page.getByTestId('login-submit-button').click()
  await page.waitForURL(/library/, { timeout: 20000 })
}

/**
 * authenticatedPage: a Page fixture that is pre-logged-in via stored session.
 * On first use it logs in via UI and saves storageState; subsequent uses load
 * the saved state directly (fast, no extra login roundtrip).
 */
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ browser }, use) => {
    const reachable = await isBaseUrlReachable()
    if (!reachable) {
      // Skip gracefully: yield a plain page so Playwright doesn't error in fixture setup,
      // but tests using this fixture should also call test.skip(!reachable).
      const context = await browser.newContext()
      const page = await context.newPage()
      await use(page)
      await context.close()
      return
    }

    const email = process.env.TEST_USER_EMAIL!
    const password = process.env.TEST_USER_PASSWORD!

    if (!fs.existsSync(STORAGE_STATE_PATH)) {
      // First time: log in through UI and persist the session
      const context = await browser.newContext()
      const page = await context.newPage()
      await performLogin(page, email, password)
      await context.storageState({ path: STORAGE_STATE_PATH })
      await context.close()
    }

    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
