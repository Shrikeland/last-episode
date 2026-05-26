# Glossary

## Phases

| Phase | Output / Acceptance |
|-------|--------------------|
| `GLOBAL_EXPLORE` | `coverage-roadmap.md` + заполненный `queue` |
| `SCAFFOLD` | `e2e/` Playwright проект + зелёный smoke-тест |
| `AREA_EXPLORE` | `areas/<area>/01-exploration.md` |
| `TEST_CASES` | `areas/<area>/02-test-cases.md` |
| `LOCATOR_AUDIT` | `areas/<area>/03-locator-audit.md` (+ опц. app-правки) |
| `IMPLEMENT` | `e2e/tests/<area>/*.spec.ts` + `04-implementation.md` |
| `VERIFY` | 2 последовательных зелёных прогона |
| `DOCUMENT` | `areas/<area>/05-coverage-matrix.md` без MISSING/PARTIAL |
| `DONE` | PR в main, область → `completed_areas` |
| `IDLE` | Все области покрыты, агент ждёт человека |

## Coverage statuses (в `05-coverage-matrix.md`)

- `COVERED` — тест есть, стабильно зелёный.
- `MISSING` — кейс из `02-test-cases.md` без реализованного теста.
- `PARTIAL` — тест есть, но покрывает не весь `expected_result`.
- `SKIPPED` — явно вне скоупа с указанием причины.

## Locator strategy tiers (из `03-locator-audit.md`)

1. `getByRole('<role>', { name: '<name>' })` — accessibility-first, **предпочтительно**.
2. `getByLabel(...)` — для form-полей.
3. `getByText(...)` — только если визуальный текст стабилен.
4. `getByTestId(...)` — fallback, когда 1-3 требуют слишком больших правок app.
5. CSS / XPath — **запрещено** без обоснования в audit doc.

## Skills, которыми пользуется агент

- `superpowers:brainstorming` — GLOBAL_EXPLORE
- `1.1:playwright-best-practices` — SCAFFOLD, IMPLEMENT, VERIFY (диагностика флак)
- `qa-test-planner` — TEST_CASES, DOCUMENT
- `vercel-react-best-practices` — LOCATOR_AUDIT (правки app-компонентов)
- `verify` — интерпретация результатов VERIFY
- `superpowers:systematic-debugging` — падения тестов
- `superpowers:skill-creator` — когда паттерн повторяется и нужен переиспользуемый скилл

## State fields

- `active.area` / `active.phase` — что сейчас в работе.
- `queue` — упорядоченный список незавершённых областей.
- `completed_areas` — упорядоченный список областей с merged PR.
- `blocked` — `null` ИЛИ объект `{ reason, area?, suggestion?, needs_human: true }`. Не-null означает «scheduled-runs становятся no-op до ручного вмешательства».
- `bootstrap.global_explore_done` / `bootstrap.scaffold_done` — one-time gates перед area-циклом.
- `last_run` — краткий след предыдущего запуска для отладки.
