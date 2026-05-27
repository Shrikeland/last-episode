import { test as authTest, expect } from '@/fixtures/auth.fixture'
import { test, expect as baseExpect } from '@playwright/test'
import { isBaseUrlReachable } from '@/support/network'

let reachable: boolean
authTest.beforeAll(async () => { reachable = await isBaseUrlReachable() })
test.beforeAll(async () => { reachable = await isBaseUrlReachable() })

test('TC-COMM-003: unauthenticated /community redirects to /login', async ({ page }) => {
  test.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto('/community', { waitUntil: 'domcontentloaded' })
  await baseExpect(page).toHaveURL(/login/, { timeout: 15000 })
})

authTest('TC-COMM-001: community page loads with user search input', async ({ authenticatedPage: page }) => {
  authTest.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto('/community', { waitUntil: 'networkidle' })
  await expect(page.getByPlaceholder('Найти пользователя по логину...')).toBeVisible({ timeout: 15000 })
})

authTest('TC-COMM-002: searching a username shows results or empty message', async ({ authenticatedPage: page }) => {
  authTest.skip(!reachable, 'BASE_URL not reachable from this environment')
  await page.goto('/community', { waitUntil: 'networkidle' })
  const input = page.getByPlaceholder('Найти пользователя по логину...')
  await input.fill('a')
  await page.waitForTimeout(600)
  // Either a UserCard or empty message should appear
  const hasResults = await page.locator('.flex.items-center.gap-3.p-4').count() > 0
  const hasEmpty = await page.getByText(/Пользователи не найдены/).isVisible().catch(() => false)
  expect(hasResults || hasEmpty).toBeTruthy()
})
