# Media Area — Locator Audit

## Locator map

| case_id | step | element | chosen locator | strategy_tier |
|---------|------|---------|----------------|---------------|
| TC-MEDIA-001 | Load via library click | card link | `LibraryPage.clickFirstCardLink()` | — |
| TC-MEDIA-001 | Assert title visible | h1 | `page.locator('h1').first()` | 1 |
| TC-MEDIA-001 | Assert status select | status-select | `page.getByTestId('status-select')` | 4 |
| TC-MEDIA-002 | Open status select | status-select | `page.getByTestId('status-select')` | 4 |
| TC-MEDIA-002 | Select Смотрю | option | `page.getByRole('option', { name: 'Смотрю' })` | 1 |
| TC-MEDIA-003 | Open season | accordion trigger | `page.getByTestId('season-accordion')` first trigger | 4 |
| TC-MEDIA-003 | Check episode | episode checkbox | `page.locator('[data-testid^="episode-checkbox-"]').first()` | 4 |
| TC-MEDIA-004 | Mark season | mark-season button | `page.locator('[data-testid^="mark-season-button-"]').first()` | 4 |
| TC-MEDIA-005 | Click notes editor | notes-editor | `page.getByTestId('notes-editor')` | 4 |
| TC-MEDIA-006 | Navigate unauthenticated | — | `page.goto('/media/nonexistent-id')` | — |

## Component changes

No app changes needed. All media components have rich data-testid coverage.

| file | change | rationale | build_ok | lint_ok |
|------|--------|-----------|----------|---------|
| — | None | Tier 4 testIds cover all steps | N/A | N/A |
