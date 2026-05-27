# Search Area — Implementation Map

| Case ID | Spec file | Test name |
|---------|-----------|-----------|
| TC-SEARCH-001 | `tests/search/search.spec.ts` | `TC-SEARCH-001: search returns results for valid query` |
| TC-SEARCH-002 | `tests/search/search.spec.ts` | `TC-SEARCH-002: search with no results shows empty message` |
| TC-SEARCH-003 | `tests/search/search.spec.ts` | `TC-SEARCH-003: clear button resets query and results` |
| TC-SEARCH-004 | `tests/search/search.spec.ts` | `TC-SEARCH-004: clicking Add opens AddToLibrary dialog` |
| TC-SEARCH-005 | `tests/search/search.spec.ts` | `TC-SEARCH-005+007: add title then re-search shows Добавлено` |
| TC-SEARCH-006 | `tests/search/search.spec.ts` | `TC-SEARCH-006: cancelling dialog does not add title` |
| TC-SEARCH-007 | `tests/search/search.spec.ts` | `TC-SEARCH-005+007: add title then re-search shows Добавлено` |
| TC-SEARCH-008 | `tests/search/search.spec.ts` | `TC-SEARCH-008: unauthenticated /search redirects to /login` |

## Page Objects

| Class | File |
|-------|------|
| `SearchPage` | `pages/SearchPage.ts` |

## Notes

- TC-SEARCH-005 and TC-SEARCH-007 combined in one test for idempotency (avoid library spam).
- Debounce wait handled in `SearchPage.search()` via `waitForTimeout(600)`.
- `authenticatedPage` fixture provides pre-logged-in session from `auth.fixture.ts`.
