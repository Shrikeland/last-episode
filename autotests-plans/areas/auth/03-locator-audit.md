# Auth Area — Locator Audit

## Locator map

| case_id | step | element | chosen locator | strategy_tier |
|---------|------|---------|----------------|---------------|
| TC-AUTH-001 | Open /login | — | `page.goto('/login')` | — |
| TC-AUTH-001 | Type email | Email input | `page.getByTestId('login-email-input')` | 4 (testId) |
| TC-AUTH-001 | Type password | Password input | `page.getByTestId('login-password-input')` | 4 (testId) |
| TC-AUTH-001 | Click submit | Submit button | `page.getByTestId('login-submit-button')` | 4 (testId) |
| TC-AUTH-002 | Same as AUTH-001 but wrong password | — | same locators | — |
| TC-AUTH-003 | Click submit without filling | Submit button | `page.getByTestId('login-submit-button')` | 4 (testId) |
| TC-AUTH-004 | Navigate to /library | — | `page.goto('/library')` | — |
| TC-AUTH-004 | Assert redirect | URL assertion | `expect(page).toHaveURL(/login/)` | — |
| TC-AUTH-005 | Click register link on /login | Register link | `page.getByTestId('login-register-link')` | 4 (testId) |
| TC-AUTH-006 | Click login link on /register | Login link | `page.getByTestId('register-login-link')` | 4 (testId) |
| TC-AUTH-007 | Type short password on register | Password input | `page.getByTestId('register-password-input')` | 4 (testId) |
| TC-AUTH-007 | Assert validation error | Error text | `page.getByText('Минимум 6 символов')` | 3 (stable text) |
| TC-AUTH-008 | Type mismatched passwords | Confirm input | `page.getByTestId('register-confirm-password-input')` | 4 (testId) |
| TC-AUTH-008 | Assert validation error | Error text | `page.getByText('Пароли не совпадают')` | 3 (stable text) |
| TC-AUTH-009 | Type username with space | Username input | `page.getByTestId('register-username-input')` | 4 (testId) |
| TC-AUTH-009 | Assert validation error | Error text | `page.getByText(/Пробелы не допускаются/)` | 3 (stable text, regex) |
| TC-AUTH-010 | Click avatar (navbar) | Avatar button | `page.getByTestId('avatar-button')` | 4 (testId) |
| TC-AUTH-010 | Click logout | Logout button | `page.getByTestId('navbar-signout-button')` | 4 (testId) |
| TC-AUTH-011 | Open /library with storageState | — | `page.goto('/library')` | — |
| TC-AUTH-011 | Assert no redirect | URL assertion | `expect(page).toHaveURL(/library/)` | — |

## Component changes

No app code changes required. All elements already have `data-testid` attributes covering tiers 3–4.

| file | change summary | rationale | build_ok | lint_ok |
|------|---------------|-----------|----------|---------|
| — | No changes needed | All critical elements have data-testid | N/A | N/A |

## Fallback decisions

- Error toast (TC-AUTH-002): `page.getByText('Неверный email или пароль')` — stable i18n string, won't change without deliberate copy update. Tier 3 (stable text) is sufficient; no testId on toast elements.
- All other auth elements: tier 4 (data-testid) already in place.

## Notes

- `navbar-signout-button` is inside a dropdown that opens on click of `avatar-button`. Test must click avatar first, then logout.
- Integration tests will skip in sandbox (Vercel 403). They run fully in CI.
- storageState file: `e2e/support/auth.storage.json` (gitignored).
