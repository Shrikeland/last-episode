# E2E Tests — last-episode

Playwright test suite for https://www.episode.watch

## Local dev setup (recommended)

This is the primary way to run tests. Playwright starts the Next.js dev server automatically.

### Prerequisites

1. **Project `.env.local`** — must exist in the repo root with Supabase, TMDB, and Groq keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   TMDB_API_KEY=...
   GROQ_API_KEY=...
   ```

2. **E2E `.env`** — fill from template:
   ```bash
   cd e2e
   cp .env.example .env
   # Edit .env: set TEST_USER_EMAIL and TEST_USER_PASSWORD
   # BASE_URL=http://localhost:3000 is already set in the template
   ```

3. **Install dependencies:**
   ```bash
   cd e2e
   npm install
   npx playwright install --with-deps chromium
   ```

### Running tests

```bash
cd e2e

# All tests — Next.js starts automatically on localhost:3000
npm test

# Specific area
npx playwright test tests/auth/

# Headed mode (visible browser, useful for debugging)
npm run test:headed

# Specific browser
npx playwright test --project=firefox
```

`reuseExistingServer: true` means if you already have `npm run dev` running in another
terminal, Playwright will use that instance instead of starting a new one.

---

## Remote / CI setup

Set `BASE_URL` to the deployed URL in `e2e/.env` or as an environment variable.
Note: the deployed Vercel app uses IP-allowlisting — the runner's IP must be whitelisted.

```bash
BASE_URL=https://www.episode.watch npx playwright test
```

---

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

Tests use a pre-authenticated session via `storageState`. The first run creates
`support/auth.storage.json` by logging in through the UI — subsequent runs reuse it.
Delete `auth.storage.json` to force a fresh login.
