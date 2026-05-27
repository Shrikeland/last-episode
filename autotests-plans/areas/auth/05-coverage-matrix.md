# Auth Area — Coverage Matrix

> Generated in DOCUMENT phase. Last green run: 2026-05-27.

## Coverage summary

| Metric | Value |
|--------|-------|
| Total test cases | 12 |
| COVERED | 12 |
| MISSING | 0 |
| PARTIAL | 0 |
| SKIPPED | 0 |

## Matrix

| case_id | title | priority | status | spec_file | last_green_at |
|---------|-------|----------|--------|-----------|---------------|
| TC-AUTH-001 | Успешный вход с корректными credentials | P0 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-002 | Вход с неверным паролем показывает ошибку | P0 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-003 | Форма не отправляется с пустыми полями | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-004 | Неавторизованный пользователь → /login | P0 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-004b | Неавторизованный /stats → /login | P0 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-005 | Переход Login→Register | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-006 | Переход Register→Login | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-007 | Inline ошибка при коротком пароле | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-008 | Inline ошибка при несовпадении паролей | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-009 | Inline ошибка при неверном username | P1 | COVERED | `tests/auth/auth.spec.ts` | 2026-05-27 |
| TC-AUTH-010 | Logout → /login + сессия очищена | P0 | COVERED | `tests/auth/auth-session.spec.ts` | 2026-05-27 |
| TC-AUTH-011 | storageState: сессия работает без re-login | P0 | COVERED | `tests/auth/auth-session.spec.ts` | 2026-05-27 |

## Notes

Tests skip gracefully in cloud sandboxes where Vercel DDoS protection blocks the IP (403 / "Host not in allowlist"). They run fully in CI environments with allowed IPs. The `isBaseUrlReachable()` guard in `support/network.ts` handles this automatically.

No app code changes were made during this area's cycle.
