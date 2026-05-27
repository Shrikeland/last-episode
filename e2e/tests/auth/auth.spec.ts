import { test, expect } from '@playwright/test'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NavbarPage } from '@/pages/NavbarPage'
import { isBaseUrlReachable } from '@/support/network'

const EMAIL = process.env.TEST_USER_EMAIL || ''
const PASSWORD = process.env.TEST_USER_PASSWORD || ''

test.describe('Auth', () => {
  let reachable: boolean

  test.beforeAll(async () => {
    reachable = await isBaseUrlReachable()
  })

  // ─── Login ──────────────────────────────────────────────────────────────

  test('TC-AUTH-001: successful login redirects to /library', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const login = new LoginPage(page)
    await login.goto()
    await login.login(EMAIL, PASSWORD)
    await expect(page).toHaveURL(/library/, { timeout: 20000 })
    await new NavbarPage(page).assertVisible()
  })

  test('TC-AUTH-002: wrong password shows error toast', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const login = new LoginPage(page)
    await login.goto()
    await login.login(EMAIL, 'wrong-password-xyz')
    await expect(page.getByText('Неверный email или пароль')).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveURL(/login/)
  })

  test('TC-AUTH-003: empty form submission does not trigger Supabase call', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const login = new LoginPage(page)
    await login.goto()

    let supabaseCallMade = false
    page.on('request', (req) => {
      if (req.url().includes('supabase') && req.url().includes('token')) {
        supabaseCallMade = true
      }
    })

    await login.submit()
    // HTML5 required validation prevents submission
    await expect(page).toHaveURL(/login/)
    expect(supabaseCallMade).toBe(false)
  })

  // ─── Protected routes ────────────────────────────────────────────────────

  test('TC-AUTH-004: unauthenticated user is redirected from /library to /login', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    await page.goto('/library', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })

  test('TC-AUTH-004b: unauthenticated user is redirected from /stats to /login', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    await page.goto('/stats', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
  })

  // ─── Navigation ──────────────────────────────────────────────────────────

  test('TC-AUTH-005: login page → register link navigates to /register', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const login = new LoginPage(page)
    await login.goto()
    await login.clickRegisterLink()
    await expect(page).toHaveURL(/register/)
    await new RegisterPage(page).assertOnPage()
  })

  test('TC-AUTH-006: register page → login link navigates to /login', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const register = new RegisterPage(page)
    await register.goto()
    await register.clickLoginLink()
    await expect(page).toHaveURL(/login/)
    await new LoginPage(page).assertOnPage()
  })

  // ─── Register validation ─────────────────────────────────────────────────

  test('TC-AUTH-007: short password shows inline error', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const register = new RegisterPage(page)
    await register.goto()
    await register.fillPassword('abc')
    await expect(page.getByText('Минимум 6 символов').first()).toBeVisible({ timeout: 5000 })
  })

  test('TC-AUTH-008: mismatched passwords show inline error', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const register = new RegisterPage(page)
    await register.goto()
    await register.fillPassword('password123')
    await register.fillConfirmPassword('password456')
    await expect(page.getByText('Пароли не совпадают').first()).toBeVisible({ timeout: 5000 })
  })

  test('TC-AUTH-009: username with space shows inline error', async ({ page }) => {
    test.skip(!reachable, 'BASE_URL not reachable from this environment')
    const register = new RegisterPage(page)
    await register.goto()
    await register.fillUsername('my user')
    await expect(page.getByText(/Пробелы не допускаются/).first()).toBeVisible({ timeout: 5000 })
  })
})
