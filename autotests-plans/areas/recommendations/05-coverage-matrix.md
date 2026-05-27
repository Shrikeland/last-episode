# Recommendations Area — Coverage Matrix

| case_id | title | priority | status | spec_file | last_green_at |
|---------|-------|----------|--------|-----------|---------------|
| TC-REC-001 | Recommendations page loads | P0 | COVERED | `tests/recommendations/recommendations.spec.ts` | 2026-05-27 |
| TC-REC-002 | Questionnaire is interactive | P1 | COVERED | `tests/recommendations/recommendations.spec.ts` | 2026-05-27 |
| TC-REC-003 | Unauthenticated redirect | P0 | COVERED | `tests/recommendations/recommendations.spec.ts` | 2026-05-27 |

## Notes
- TC-REC-002 skips if user already has recommendations (no questionnaire shown).
- Full streaming test (Groq SSE) requires live app access — deferred to post-sandbox CI run.
