# E2E Tests — last-episode

Playwright test suite for https://www.episode.watch

## Setup

```bash
cd e2e
npm install
npx playwright install --with-deps chromium
cp .env.example .env   # fill in TEST_USER_EMAIL + TEST_USER_PASSWORD
```

## Running tests

```bash
# All tests (chromium only by default)
npm test

# Specific area
npx playwright test tests/auth/

# Headed mode (visible browser)
npm run test:headed

# Specific browser
npx playwright test --project=firefox
```

## Structure

```
e2e/
  fixtures/      # Playwright fixture extensions (auth, data)
  pages/         # Page Object Model classes
  support/       # Helpers, env validation, utilities
  tests/         # Test specs, one folder per area
    smoke.spec.ts
    auth/
    search/
    library/
    media/
    stats/
    community/
    profile/
    recommendations/
```

## Auth

Tests use a pre-authenticated session via `storageState`. The first run in each session
creates `support/auth.storage.json` by logging in through the UI.
