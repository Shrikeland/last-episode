import { type Page, expect } from '@playwright/test'

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/register', { waitUntil: 'networkidle' })
  }

  async fillUsername(username: string) {
    await this.page.getByTestId('register-username-input').fill(username)
  }

  async fillEmail(email: string) {
    await this.page.getByTestId('register-email-input').fill(email)
  }

  async fillPassword(password: string) {
    await this.page.getByTestId('register-password-input').fill(password)
  }

  async fillConfirmPassword(password: string) {
    await this.page.getByTestId('register-confirm-password-input').fill(password)
  }

  async submit() {
    await this.page.getByTestId('register-submit-button').click()
  }

  async clickLoginLink() {
    await this.page.getByTestId('register-login-link').click()
  }

  async assertOnPage() {
    await expect(this.page).toHaveURL(/register/)
    await expect(this.page.getByTestId('register-form')).toBeVisible()
  }

  async assertFormError(text: string | RegExp) {
    await expect(this.page.getByTestId('register-form-error')).toContainText(text)
  }
}
