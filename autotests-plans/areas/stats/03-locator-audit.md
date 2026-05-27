# Stats Area — Locator Audit

No app changes needed. Stats page uses stable text (tier 3). No data-testid present, but text labels are static i18n strings unlikely to change.

## Locator map

| case_id | step | element | chosen locator | strategy_tier |
|---------|------|---------|----------------|---------------|
| TC-STATS-001 | Assert heading | h1 | `page.locator('h1').filter({ hasText: 'Статистика' })` | 3 |
| TC-STATS-001 | Assert time block | Time label | `page.getByText(/Общее время просмотра/)` | 3 |
| TC-STATS-002 | Navigate unauthenticated | — | `page.goto('/stats')` | — |

## Component changes

None needed.
