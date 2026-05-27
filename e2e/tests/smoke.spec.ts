import { test, expect } from '@playwright/test'

/**
 * Smoke tests verify the Playwright scaffold is working.
 * Network-dependent tests (against www.episode.watch) are conditioned on
 * BASE_URL being reachable — in cloud CI they run fully; in sandboxes that
 * block outbound traffic they skip gracefully.
 */

const BASE_URL = process.env.BASE_URL || 'https://www.episode.watch'

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(8000) })
    return res.status < 500 && res.status !== 403
  } catch {
    return false
  }
}

test('scaffold: Playwright browser launches and can render local HTML', async ({ page }) => {
  await page.setContent('<html><head><title>Scaffold OK</title></head><body><h1>OK</h1></body></html>')
  await expect(page.locator('h1')).toHaveText('OK')
  await expect(page).toHaveTitle('Scaffold OK')
})

test('scaffold: page navigation works', async ({ page }) => {
  await page.setContent('<html><body><a href="#section">go</a><section id="section">here</section></body></html>')
  await page.click('a')
  await expect(page.locator('section')).toBeVisible()
})

test('integration: /login page renders a login form', async ({ page }) => {
  const reachable = await isUrlReachable(`${BASE_URL}/login`)
  if (!reachable) {
    test.skip(true, `${BASE_URL} is not reachable from this environment (likely Vercel DDoS protection). Run from CI.`)
    return
  }
  await page.goto('/login', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/login/)
  await expect(page.getByTestId('login-email-input')).toBeVisible({ timeout: 15000 })
})

test('integration: root redirects to auth when unauthenticated', async ({ page }) => {
  const reachable = await isUrlReachable(`${BASE_URL}/`)
  if (!reachable) {
    test.skip(true, `${BASE_URL} is not reachable from this environment. Run from CI.`)
    return
  }
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/login|register/, { timeout: 15000 })
})
