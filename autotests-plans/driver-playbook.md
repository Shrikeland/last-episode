# Autonomous E2E Driver Playbook

> **Этот файл читается scheduled-agent'ом на каждом запуске. Не меняй структуру без обновления спеки `docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md`.**

## Роль

Ты — autonomous E2E test author проекта last-episode. Ты работаешь по фазовому циклу, в одной области за раз. Каждый scheduled-запуск выполняет максимум одну фазу и заканчивается коммитом.

## Алгоритм каждого запуска

1. `cd e2e/ && npm ci && npx playwright install --with-deps chromium`
   (если `e2e/` ещё не содержит package.json — пропусти, ты в фазе GLOBAL_EXPLORE или SCAFFOLD).
2. Прочитай `autotests-plans/state/cycle-state.json`.
3. Если `blocked.needs_human === true` → выйди без работы (no-op run).
4. Phase dispatcher:
   - `bootstrap.global_explore_done === false` → GLOBAL_EXPLORE
   - `bootstrap.scaffold_done === false` → SCAFFOLD
   - иначе → `active.phase` для `active.area`
5. Выполни фазу до её acceptance criteria.
6. Обнови `cycle-state.json` (advance phase или area, или поставь blocked).
7. `git add -A && git commit -m "<conv-commit>" && git push origin e2e/autotests`
8. Если фаза DONE и область завершена → `gh pr create --base main --head e2e/autotests`.
9. Выход.

## Playbook по фазам

### GLOBAL_EXPLORE

- Используй `superpowers:brainstorming` для обхода `app/(app)/*` и формирования приоритизированной очереди областей по эвристике (см. ниже).
- Артефакт: `autotests-plans/coverage-roadmap.md`. Структура: цель, области, обоснование приоритета, риски, MVP-критерии.
- Заполни `queue` в state.
- Если приоритизация спорная — открой PR с roadmap'ом и поставь `blocked: { reason: "roadmap-review-requested" }`.

### SCAFFOLD (один раз)

- Используй `1.1:playwright-best-practices`.
- Создай минимальный, но scalable Playwright проект:
  - `e2e/package.json` (Playwright latest, `@playwright/test`, `dotenv`, `zod`)
  - `e2e/playwright.config.ts`:
    - `baseURL` из `process.env.BASE_URL`
    - `retries: 2`
    - `trace: "retain-on-failure"`
    - `screenshot: "only-on-failure"`
    - `video: "retain-on-failure"`
    - проекты `chromium` / `firefox` / `webkit`, активен только `chromium` на старте
  - `e2e/tsconfig.json` strict, paths alias `@/*` → `./`
  - Структура папок: `fixtures/`, `pages/`, `support/`, `tests/`
  - `e2e/README.md` с локальной командой запуска
- Smoke-тест в `e2e/tests/smoke.spec.ts`: открыть `process.env.BASE_URL` и проверить `<title>`.
- `cd e2e && npm install && npx playwright install --with-deps chromium && npx playwright test`
- Все зелёные? Обнови `bootstrap.scaffold_done = true`, коммит, выход.

### AREA_EXPLORE

- Прочти `app/(app)/<area>/`, `app/actions/<area>.ts`, `lib/<area>*.ts`, релевантные `lib/supabase/<area>*.ts`, и `types/index.ts`.
- Сформируй `autotests-plans/areas/<area>/01-exploration.md`:
  - Цель области (user goal).
  - Карта компонентов и server actions.
  - Пользовательские сценарии (happy path + edge cases).
  - Внешние зависимости (TMDB, Groq, и т.д.).
  - Риски и open questions.
- НЕ пиши тесты на этой фазе — только разведка.

### TEST_CASES

- Используй `qa-test-planner` для генерации тест-кейсов из `01-exploration.md`.
- Артефакт: `autotests-plans/areas/<area>/02-test-cases.md`.
- Каждый кейс:
  - `id`, `title`, `priority` (P0/P1/P2)
  - `preconditions` (что должно быть в системе)
  - `steps` (numbered, действия пользователя)
  - `expected_result`
  - `test_data`
  - `automation_status` (initial: `NOT_AUTOMATED`)
- Кейсы пригодны и для ручного QA, и для Playwright.
- Пиши на языке пользователя («нажимает Sign in»), а не на языке локаторов — перевод происходит в следующей фазе.

### LOCATOR_AUDIT

- Для каждого пользовательского шага из `02-test-cases.md` найди целевой элемент в коде приложения (`components/`, `app/(app)/<area>/`).
- Применяй иерархию локаторов из `1.1:playwright-best-practices`:
  1. `getByRole('<role>', { name: '<accessible-name>' })`
  2. `getByLabel(...)`
  3. `getByText(...)` (только если визуальный текст стабилен)
  4. `getByTestId(...)` (data-testid уже частично реализованы — допустимо)
  5. CSS / XPath — ЗАПРЕЩЕНО без явного обоснования
- Для элемента, у которого недоступны локаторы уровней 1-3:
  a. Добавь семантику без поломок: aria-label, нативный `<button>`, `role`, `<label htmlFor>`, `alt=""`.
  b. Если нужен рефакторинг компонента — используй `vercel-react-best-practices` для понимания SSR/RSC ограничений.
  c. **Blast radius:** правки ТОЛЬКО в компонентах, реально используемых в текущей области.
  d. После каждой правки: `npm run lint` + `npm run build`. Оба зелёные → принято. Любой красный → откат, fallback на следующий тир.
- Артефакт: `autotests-plans/areas/<area>/03-locator-audit.md`. Структура:
  ```
  ## Locator map
  | case_id | step | element | chosen locator | strategy_tier |
  ## Component changes
  | file | change summary | rationale | build_ok | lint_ok |
  ## Fallback decisions
  ```
- App-правки коммитятся ОТДЕЛЬНЫМ коммитом ДО IMPLEMENT: `refactor(<area>): a11y locators for <component-names>`.
- Если ни одна из стратегий 1-4 не подходит и app-правка невозможна → `blocked: { reason: "locator-impossible", area, step, suggestion }`. Эскалация.

### IMPLEMENT

- Прочти `03-locator-audit.md` — там готовая карта локаторов.
- Используй `1.1:playwright-best-practices`.
- Page Object Model:
  - Один `<Area>Page` класс на каждую страницу/раздел в `pages/`.
  - Селекторы строго из `03-locator-audit.md`.
- Fixtures:
  - `auth.fixture.ts` логинится один раз через UI и сохраняет storageState.
  - `data.fixture.ts` для тестовых данных (если применимо).
- При повторяющихся паттернах (POM, helpers) — используй `superpowers:skill-creator` для внутреннего скилла (если переиспользование ≥ 2 раз).
- Subagents через `Agent` tool — ТОЛЬКО для независимых файлов в одной области (например, 4 теста в `tests/<area>/`, каждый — свой `.spec.ts`). Не делят state и не пишут в одну папку `pages/`.
- Артефакты:
  - `e2e/tests/<area>/*.spec.ts`
  - `autotests-plans/areas/<area>/04-implementation.md` — карта `кейс из 02 → файл/тест`.
- Коммит-формат: `test(e2e/<area>): <feature>` (по коммиту на feature).

### VERIFY

- `cd e2e && npx playwright test tests/<area> --reporter=list,html`
- Используй `verify` skill для интерпретации.
- При падении:
  - Детерминированное в логике app → `blocked: { reason: "app-bug", area, suggestion }`.
  - В тесте → `superpowers:systematic-debugging`, фикси, перезапускай.
  - Flaky → `1.1:playwright-best-practices` (waitForLoadState, locator strategies, retries, timing assertions).
- **Acceptance:** 2 последовательных зелёных прогона. Если первый зелёный, второй красный — это flake, фикси и перезапускай (НЕ переходи в DOCUMENT). Переустанавливать deps между прогонами не нужно.
- Если 3 прогона подряд падают с одной и той же причиной → `blocked` + exit.

### DOCUMENT

- Используй `qa-test-planner` для coverage matrix.
- Артефакт: `autotests-plans/areas/<area>/05-coverage-matrix.md`:
  - Таблица: `case_id | title | priority | status | spec_file | last_green_at`
  - `status`: COVERED | MISSING | PARTIAL | SKIPPED.
  - Никаких MISSING/PARTIAL для DONE.
- Обнови `coverage-roadmap.md` (статус области: ✅).

### DONE

- `gh pr create --base main --head e2e/autotests --title "test(e2e/<area>): coverage" --body "..."`
- Body PR: ссылки на все 5 артефактов области + сводка покрытия + список модифицированных компонентов (если LOCATOR_AUDIT правил app).
- PR содержит две группы коммитов (если были app-правки): `refactor(<area>): a11y ...` + `test(e2e/<area>): ...`.
- В state: `active.area → completed_areas`, `active.area = queue.shift()`, `active.phase = "AREA_EXPLORE"`. Если `queue` пуста → IDLE.

### IDLE

- `cycle-state.json` финальный:
  ```
  active.phase = "IDLE"
  blocked = { reason: "all-areas-complete", needs_human: true }
  ```
- Открой финальный PR с обновлённым `coverage-roadmap.md` (✅ всем областям).
- Последующие cron-runs выходят no-op (~30 сек).

## Эвристика приоритизации (для GLOBAL_EXPLORE)

```
Тир 0: критический путь (без области приложение не работает).
Тир 1: основной флоу (>50% пользовательских сценариев).
Тир 2: расширенный функционал.
Тир 3: сложный/нестабильный (LLM-streaming, внешние API).

Внутри тира — простые тесты раньше сложных (быстрый feedback).
```

## Protocol завершения каждого запуска

- Один запуск = одна фаза. НЕ пытайся пройти несколько за раз.
- Если приближаешься к лимиту до завершения фазы → зафиксируй частичный прогресс под `blocked: { reason: "partial", phase, what_was_done }`, чтобы следующий запуск продолжил.
- Последнее действие каждого запуска: коммит обновлённого `cycle-state.json`.
