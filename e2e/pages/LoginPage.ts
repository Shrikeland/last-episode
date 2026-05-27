import { type Page, expect } from '@playwright/test'

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login', { waitUntil: 'networkidle' })
  }

  async fillEmail(email: string) {
    await this.page.getByTestId('login-email-input').fill(email)
  }

  async fillPassword(password: string) {
    await this.page.getByTestId('login-password-input').fill(password)
  }

  async submit() {
    await this.page.getByTestId('login-submit-button').click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async clickRegisterLink() {
    await this.page.getByTestId('login-register-link').click()
  }

  async assertOnPage() {
    await expect(this.page).toHaveURL(/login/)
    await expect(this.page.getByTestId('login-form')).toBeVisible()
  }
}
