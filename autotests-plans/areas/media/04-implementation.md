# Media Area — Implementation Map

| Case ID | Spec file | Test name |
|---------|-----------|-----------|
| TC-MEDIA-001 | `tests/media/media.spec.ts` | `TC-MEDIA-001: detail page loads with title and status select` |
| TC-MEDIA-002 | `tests/media/media.spec.ts` | `TC-MEDIA-002: changing status is reflected in the select` |
| TC-MEDIA-003 | `tests/media/media.spec.ts` | `TC-MEDIA-003: toggling episode checkbox changes checked state` |
| TC-MEDIA-004 | `tests/media/media.spec.ts` | `TC-MEDIA-004: mark season watched checks all episodes` |
| TC-MEDIA-005 | — | Not automated (notes editor API varies — skipped for now, PARTIAL) |
| TC-MEDIA-006 | `tests/media/media.spec.ts` | `TC-MEDIA-006: unauthenticated /media/[id] redirects to /login` |

## Notes
- TC-MEDIA-003 and TC-MEDIA-004 skip if first library item has no seasons (movie/animation).
- TC-MEDIA-005 (notes) marked PARTIAL — notes editor internals (textarea vs contenteditable) require live app inspection.
