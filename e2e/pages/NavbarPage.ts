import { type Page, expect } from '@playwright/test'

export class NavbarPage {
  constructor(private readonly page: Page) {}

  async logout() {
    await this.page.getByTestId('avatar-button').click()
    await this.page.getByTestId('navbar-signout-button').waitFor({ state: 'visible' })
    await this.page.getByTestId('navbar-signout-button').click()
    await this.page.waitForURL(/login/, { timeout: 10000 })
  }

  async assertVisible() {
    await expect(this.page.getByTestId('navbar')).toBeVisible()
  }
}
