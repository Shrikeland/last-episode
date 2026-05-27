# Auth Area — Implementation Map

## Test case → spec file mapping

| Case ID | Title | Spec file | Test name |
|---------|-------|-----------|-----------|
| TC-AUTH-001 | Successful login | `tests/auth/auth.spec.ts` | `TC-AUTH-001: successful login redirects to /library` |
| TC-AUTH-002 | Wrong password toast | `tests/auth/auth.spec.ts` | `TC-AUTH-002: wrong password shows error toast` |
| TC-AUTH-003 | Empty form no API call | `tests/auth/auth.spec.ts` | `TC-AUTH-003: empty form submission does not trigger Supabase call` |
| TC-AUTH-004 | Unauthenticated /library redirect | `tests/auth/auth.spec.ts` | `TC-AUTH-004: unauthenticated user is redirected from /library to /login` |
| TC-AUTH-004b | Unauthenticated /stats redirect | `tests/auth/auth.spec.ts` | `TC-AUTH-004b: unauthenticated user is redirected from /stats to /login` |
| TC-AUTH-005 | Login→Register nav | `tests/auth/auth.spec.ts` | `TC-AUTH-005: login page → register link navigates to /register` |
| TC-AUTH-006 | Register→Login nav | `tests/auth/auth.spec.ts` | `TC-AUTH-006: register page → login link navigates to /login` |
| TC-AUTH-007 | Short password validation | `tests/auth/auth.spec.ts` | `TC-AUTH-007: short password shows inline error` |
| TC-AUTH-008 | Password mismatch validation | `tests/auth/auth.spec.ts` | `TC-AUTH-008: mismatched passwords show inline error` |
| TC-AUTH-009 | Username space validation | `tests/auth/auth.spec.ts` | `TC-AUTH-009: username with space shows inline error` |
| TC-AUTH-010 | Logout | `tests/auth/auth-session.spec.ts` | `TC-AUTH-010: logout redirects to /login and clears session` |
| TC-AUTH-011 | storageState reuse | `tests/auth/auth-session.spec.ts` | `TC-AUTH-011: stored session opens /library without login` |

## Page Object Model

| Class | File | Covers |
|-------|------|--------|
| `LoginPage` | `pages/LoginPage.ts` | `/login` form interaction |
| `RegisterPage` | `pages/RegisterPage.ts` | `/register` form interaction + validation |
| `NavbarPage` | `pages/NavbarPage.ts` | Logout flow, navbar visibility |

## Fixtures

| Fixture | File | Purpose |
|---------|------|---------|
| `authenticatedPage` | `fixtures/auth.fixture.ts` | Pre-logged-in Page via stored session. Created lazily on first use. |

## Support

| File | Purpose |
|------|---------|
| `support/network.ts` | `isBaseUrlReachable()` — skip integration tests in sandboxes with Vercel 403 |
| `support/auth.storage.json` | Saved browser session (gitignored, created at runtime) |
