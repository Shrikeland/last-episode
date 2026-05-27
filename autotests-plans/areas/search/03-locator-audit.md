# Search Area — Locator Audit

## Locator map

| case_id | step | element | chosen locator | strategy_tier |
|---------|------|---------|----------------|---------------|
| TC-SEARCH-001 | Type query | Search input | `page.getByTestId('search-input')` | 4 |
| TC-SEARCH-001 | Wait for results | First result card | `page.locator('[data-testid^="tmdb-result-card-"]').first()` | 4 |
| TC-SEARCH-002 | Type query | Search input | `page.getByTestId('search-input')` | 4 |
| TC-SEARCH-002 | Assert empty message | Empty text | `page.getByText(/Ничего не найдено/)` | 3 |
| TC-SEARCH-003 | Click clear | Clear button | `page.getByRole('button', { name: 'Очистить поиск' })` | 1 |
| TC-SEARCH-003 | Assert cleared | Search input | `page.getByTestId('search-input')` empty | 4 |
| TC-SEARCH-004 | Click Add on first card | Add button | `firstCard.getByRole('button', { name: 'Добавить' })` | 1 |
| TC-SEARCH-004 | Assert dialog open | Dialog | `page.getByRole('dialog')` | 1 |
| TC-SEARCH-005 | Click Confirm | Save button | `page.getByRole('button', { name: 'Сохранить' })` | 1 |
| TC-SEARCH-005 | Assert added | Card button | `firstCard.getByRole('button', { name: 'Добавлено' })` | 1 |
| TC-SEARCH-005 | Assert toast | Success toast | `page.getByText(/добавлен в коллекцию/)` | 3 |
| TC-SEARCH-006 | Click Cancel | Cancel button | `page.getByRole('button', { name: 'Отмена' })` | 1 |
| TC-SEARCH-007 | Verify already added | Card button | `firstCard.getByRole('button', { name: 'Добавлено' })` disabled | 1 |
| TC-SEARCH-008 | Navigate to /search | — | `page.goto('/search')` | — |
| TC-SEARCH-008 | Assert redirect | URL | `expect(page).toHaveURL(/login/)` | — |

## Component changes

No app changes needed. All critical elements have accessible roles/labels and data-testid.
The "Добавить" / "Добавлено" button text is stable (getByRole tier 1 is sufficient).

| file | change summary | rationale | build_ok | lint_ok |
|------|---------------|-----------|----------|---------|
| — | None needed | Accessible roles + testIds cover all cases | N/A | N/A |

## Fallback decisions

- Result cards scoped via `[data-testid^="tmdb-result-card-"]` prefix selector (no exact ID needed for first-card operations).
- Toast: `getByText(/добавлен в коллекцию/)` — stable i18n string.
