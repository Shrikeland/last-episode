# Library Area — Locator Audit

## Locator map

| case_id | step | element | chosen locator | strategy_tier |
|---------|------|---------|----------------|---------------|
| TC-LIB-001 | Open /library | — | `page.goto('/library')` | — |
| TC-LIB-001 | Assert cards visible | First card | `page.locator('[data-testid^="media-card-"]').first()` | 4 |
| TC-LIB-002 | Type in filter | Search input | `page.getByPlaceholder('Поиск по названию...')` | 3 |
| TC-LIB-003 | Select status filter | Status combobox | `page.getByRole('combobox').first()` | 1 |
| TC-LIB-004 | Click delete on card | Delete button | `firstCard.getByRole('button', { name: 'Удалить' })` (aria-label) | 1 |
| TC-LIB-004 | Confirm delete | Confirm button | `page.getByRole('alertdialog').getByRole('button', { name: 'Удалить' })` | 1 |
| TC-LIB-005 | Cancel delete | Cancel button | `page.getByRole('alertdialog').getByRole('button', { name: 'Отмена' })` | 1 |
| TC-LIB-006 | Click card link | Card link | `firstCard.locator('a').first()` | 1 |
| TC-LIB-007 | Navigate unauthenticated | — | `page.goto('/library')` | — |

## Component changes

No app changes needed. Existing `data-testid="media-card-{id}"` + `aria-label="Удалить"` cover delete flow. FilterBar locators use placeholder (tier 3) and role (tier 1).

| file | change summary | rationale | build_ok | lint_ok |
|------|---------------|-----------|----------|---------|
| — | None needed | All critical elements addressable | N/A | N/A |
