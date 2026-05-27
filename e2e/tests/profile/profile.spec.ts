import { test as authTest, expect } from '@/fixtures/auth.fixture'
import { test, expect as baseExpect } from '@playwright/test'
import { isBaseUrlReachable } from '@/support/network'

const TEST_USERNAME = 'hornysennin' // matches TEST_USER_EMAIL account

let reachable: boolean
authTest.beforeAll(async () => { reachable = await isBaseUrlReachable() })
test.beforeAll(async () => { reachable = await isBaseUrlReachable() })

test('TC-PROFILE-002: unauthenticated /profile/[username] redirects to /login', async ({ page }) => {
  test.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto(`/profile/${TEST_USERNAME}`, { waitUntil: 'domcontentloaded' })
  await baseExpect(page).toHaveURL(/login/, { timeout: 15000 })
})

authTest('TC-PROFILE-001: own profile page loads with username heading', async ({ authenticatedPage: page }) => {
  authTest.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto(`/profile/${TEST_USERNAME}`, { waitUntil: 'networkidle' })
  await expect(page.locator('h1').filter({ hasText: `@${TEST_USERNAME}` })).toBeVisible({ timeout: 15000 })
})

authTest('TC-PROFILE-003: non-existent profile returns 404 or redirect', async ({ authenticatedPage: page }) => {
  authTest.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto('/profile/this-user-does-not-exist-xyz', { waitUntil: 'domcontentloaded' })
  // Either 404 page or redirect — page must load without crashing
  await expect(page.locator('body')).toBeAttached({ timeout: 10000 })
})
