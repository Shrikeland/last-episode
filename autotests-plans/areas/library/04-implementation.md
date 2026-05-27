# Library Area — Implementation Map

| Case ID | Spec file | Test name |
|---------|-----------|-----------|
| TC-LIB-001 | `tests/library/library.spec.ts` | `TC-LIB-001: library page shows media cards` |
| TC-LIB-002 | `tests/library/library.spec.ts` | `TC-LIB-002: text filter narrows results and updates URL` |
| TC-LIB-003 | `tests/library/library.spec.ts` | `TC-LIB-003: status filter updates URL` |
| TC-LIB-004 | `tests/library/library.spec.ts` | `TC-LIB-004: delete item removes card from library` |
| TC-LIB-005 | `tests/library/library.spec.ts` | `TC-LIB-005: cancel delete keeps card in library` |
| TC-LIB-006 | `tests/library/library.spec.ts` | `TC-LIB-006: clicking card navigates to /media/[id]` |
| TC-LIB-007 | `tests/library/library.spec.ts` | `TC-LIB-007: unauthenticated /library redirects to /login` |

## Page Objects

| Class | File |
|-------|------|
| `LibraryPage` | `pages/LibraryPage.ts` |
