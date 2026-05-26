# Autonomous E2E Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Зафиксировать инфраструктуру для автономной E2E-разработки: каталоги, state-файл, driver playbook, секреты, permissions, slash-команда, scheduled task, bootstrap-PR — всё, что нужно scheduled-agent'у для старта первой фазы (GLOBAL_EXPLORE) после merge'а.

**Architecture:** Phase-based state machine оркеструется одним Anthropic scheduled-agent'ом (cron `10 */5 * * *`). State хранится в `autotests-plans/state/cycle-state.json`, инструкции для агента — в `autotests-plans/driver-playbook.md`. Сам Playwright проект (`e2e/`) и тесты создаются агентом в фазах SCAFFOLD и per-area цикле — НЕ этим планом.

**Tech Stack:** Markdown + JSON для документации/state, `mcp__scheduled-tasks__create_scheduled_task` для cron, существующие git/gh CLI для PR.

**Scope boundaries:**
- ✅ В скоупе: каркас директорий, текстовые/JSON артефакты, конфиги, scheduled task, bootstrap-PR
- ❌ НЕ в скоупе: `e2e/package.json`, `playwright.config.ts`, тесты, `coverage-roadmap.md`, `areas/<area>/*` (всё это создаёт scheduled-agent)

---

### Task 1: Создать каталоговый скелет

**Files:**
- Create: `autotests-plans/`
- Create: `autotests-plans/state/`
- Create: `autotests-plans/areas/`
- Create: `e2e/`

- [ ] **Step 1: Создать директории**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24
mkdir -p autotests-plans/state autotests-plans/areas e2e
```

- [ ] **Step 2: Подтвердить структуру**

```bash
ls -la autotests-plans/ e2e/
```
Expected:
```
autotests-plans/:
  state/  areas/
e2e/:
  (empty)
```

---

### Task 2: `e2e/.gitkeep` (placeholder)

**Files:**
- Create: `e2e/.gitkeep`

- [ ] **Step 1: Создать пустой keepalive-файл**

```bash
touch /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24/e2e/.gitkeep
```

Содержимое не нужно — agent заполнит `e2e/` в фазе SCAFFOLD. `.gitkeep` только чтобы git отследил пустую папку.

---

### Task 3: `e2e/.env` и `e2e/.env.example`

**Files:**
- Create: `e2e/.env` (gitignored — реальные креды)
- Create: `e2e/.env.example` (в git — плейсхолдеры)

- [ ] **Step 1: Записать `e2e/.env.example`**

Use Write tool. Path: `e2e/.env.example`
Content:
```
# Test target (primary)
BASE_URL=https://www.episode.watch
FALLBACK_URL=https://last-episode.vercel.app

# Test user credentials (fill before running locally)
TEST_USER_EMAIL=
TEST_USER_PASSWORD=

# Browser mode
HEADLESS=true
```

- [ ] **Step 2: Записать `e2e/.env`**

Use Write tool. Path: `e2e/.env`
Content:
```
BASE_URL=https://www.episode.watch
FALLBACK_URL=https://last-episode.vercel.app
TEST_USER_EMAIL=hornysennin@gmail.com
TEST_USER_PASSWORD=QASenninMode94
HEADLESS=true
```

- [ ] **Step 3: Не коммитить пока — `.gitignore` обновится в task 9**

---

### Task 4: `autotests-plans/state/cycle-state.json` (initial state)

**Files:**
- Create: `autotests-plans/state/cycle-state.json`

- [ ] **Step 1: Записать initial state**

Use Write tool. Path: `autotests-plans/state/cycle-state.json`
Content:
```json
{
  "schema_version": "1.0",
  "updated_at": "2026-05-26T00:00:00Z",
  "updated_by": "bootstrap",
  "bootstrap": {
    "global_explore_done": false,
    "scaffold_done": false
  },
  "active": {
    "area": null,
    "phase": "GLOBAL_EXPLORE"
  },
  "queue": [],
  "completed_areas": [],
  "blocked": null,
  "last_run": null
}
```

- [ ] **Step 2: Валидировать JSON**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && python3 -c "import json; json.load(open('autotests-plans/state/cycle-state.json'))" && echo "OK"
```
Expected: `OK`

---

### Task 5: `autotests-plans/README.md` (entry point для человека)

**Files:**
- Create: `autotests-plans/README.md`

- [ ] **Step 1: Записать README**

Use Write tool. Path: `autotests-plans/README.md`
Content:
````markdown
# autotests-plans/

Source of truth для **автономного процесса написания E2E тестов**. Эта папка читается:

1. **Тобой (человеком)** — чтобы видеть где сейчас находится scheduled-agent, что сделано, что запланировано.
2. **Scheduled-agent'ом** — чтобы определить следующую фазу и записать в git результаты работы.

## Карта папки

```
autotests-plans/
├── README.md                 ← вы здесь
├── glossary.md               ← терминология (фазы, статусы, скиллы)
├── driver-playbook.md        ← длинные инструкции, которые агент читает на каждом запуске
├── coverage-roadmap.md       ← создаётся агентом в фазе GLOBAL_EXPLORE
├── state/
│   └── cycle-state.json      ← оркестровка: текущая фаза/область/очередь/blocked
└── areas/<area-name>/        ← одна папка на область приложения, заполняется агентом
    ├── 01-exploration.md
    ├── 02-test-cases.md
    ├── 03-locator-audit.md
    ├── 04-implementation.md
    └── 05-coverage-matrix.md
```

## Как проверить прогресс

1. Открой `state/cycle-state.json`:
   - `active.area` и `active.phase` — что агент делает прямо сейчас.
   - `queue` — оставшиеся области.
   - `completed_areas` — области с merged PR'ами.
   - `blocked` — если не `null`, агент остановился и ждёт тебя. Прочти `blocked.reason`.

2. Посмотри последний коммит на ветке `e2e/autotests`.

3. Открой `coverage-roadmap.md` для общей карты покрытия.

## Ручной запуск итерации

`/e2e-cycle` (slash-команда в Claude Code, в корне репо) — выполнить ОДНУ фазу локально, не дожидаясь следующего scheduled-тика.

## Где лежат сами тесты

В папке `e2e/` в корне репо (отдельный package, свой `playwright.config.ts`). Эта папка пустая до тех пор, пока scheduled-agent не выполнит фазу SCAFFOLD.

## Спецификация

Полный дизайн процесса: [docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md](../docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md).
````

---

### Task 6: `autotests-plans/glossary.md`

**Files:**
- Create: `autotests-plans/glossary.md`

- [ ] **Step 1: Записать глоссарий**

Use Write tool. Path: `autotests-plans/glossary.md`
Content:
````markdown
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
````

---

### Task 7: `autotests-plans/driver-playbook.md`

**Files:**
- Create: `autotests-plans/driver-playbook.md`

- [ ] **Step 1: Записать playbook**

Use Write tool. Path: `autotests-plans/driver-playbook.md`
Content:
````markdown
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
````

---

### Task 8: `.claude/commands/e2e-cycle.md` (slash-команда)

**Files:**
- Create: `.claude/commands/e2e-cycle.md`

- [ ] **Step 1: Создать папку команд (если не существует)**

```bash
mkdir -p /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24/.claude/commands
```

- [ ] **Step 2: Записать команду**

Use Write tool. Path: `.claude/commands/e2e-cycle.md`
Content:
```markdown
---
description: Run one iteration of the autonomous E2E cycle locally (same as scheduled-agent does)
---

You are entering the autonomous E2E cycle for this iteration.

Read `autotests-plans/driver-playbook.md` and execute exactly one phase
of the cycle, then commit the result on branch `e2e/autotests` and stop.

State file: `autotests-plans/state/cycle-state.json`
Working directory: repo root

Constraints:
- Execute MAXIMUM ONE phase per invocation.
- Always end with a commit (even if just updating cycle-state.json with `blocked`).
- Never modify files outside the repo or files unrelated to the current phase.

Begin.
```

---

### Task 9: Обновить корневой `.gitignore`

**Files:**
- Modify: `.gitignore` (append e2e-специфичные пути)

- [ ] **Step 1: Добавить e2e-секцию**

Use Edit tool на файле `.gitignore`. Append after line 63 (после `/supabase/.temp`):

old_string:
```
# supabase
/supabase/.branches
/supabase/.temp
```

new_string:
```
# supabase
/supabase/.branches
/supabase/.temp

# e2e (Playwright project)
e2e/node_modules/
e2e/.env
e2e/playwright-report/
e2e/test-results/
e2e/blob-report/
```

(Note: `.env` уже игнорируется глобально через паттерн `.env` на строке 31, но `e2e/.env` оставляем explicitly для документации намерения.)

- [ ] **Step 2: Подтвердить, что `e2e/.env` не отслеживается**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && git check-ignore -v e2e/.env
```
Expected: вывод вида `.gitignore:NN:e2e/.env  e2e/.env` (показывает, какое правило сматчилось).

---

### Task 10: Обновить `.claude/settings.local.json` (allow-list)

**Files:**
- Modify: `.claude/settings.local.json` (полная замена `allow` массива)

- [ ] **Step 1: Прочитать текущий файл**

Use Read tool на `.claude/settings.local.json`, чтобы получить актуальный снимок (структура с `permissions.allow` массивом).

- [ ] **Step 2: Заменить `allow` массив**

Use Edit tool. Заменить старый `allow` массив (содержащий устаревшие пути `/Users/hornysennin/Desktop/...`) на новый:

old_string (текущий блок `permissions`):
```json
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode -name *.tsx -not -path */node_modules/*)",
      "WebFetch(domain:github.com)",
      "WebSearch",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(ls:*)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode/app/api -type f -name *.ts -o -name *.tsx)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode -path ./node_modules -prune -o -path ./.next -prune -o -type f \\\\\\(-name *.tsx -o -name *.ts \\\\\\) -print)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode -path ./node_modules -prune -o -path ./.next -prune -o -type f -name *.ts -o -name *.tsx -print)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode -path ./node_modules -prune -o -path ./.next -prune -o -type f \\\\\\(-name *.sql \\\\\\) -print)",
      "Bash(find /Users/hornysennin/Desktop/projects/last-episode/app/api -type f -name *.ts -o -name *.js)",
      "Bash(npx supabase:*)",
      "mcp__context7__query-docs",
      "Bash(npx eslint:*)",
      "Bash(npx next *)",
      "Bash(node *)",
      "Bash(python3 -c \"import sys,json; d=json.load\\(sys.stdin\\); print\\(json.dumps\\(d.get\\('exports',{}\\), indent=2\\)\\)\")",
      "WebFetch(domain:api.anthropic.com)",
      "Bash(npx tsc *)"
    ]
  },
```

new_string:
```json
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(npm ci:*)",
      "Bash(npx playwright:*)",
      "Bash(npx tsc:*)",
      "Bash(npx eslint:*)",
      "Bash(npx supabase:*)",
      "Bash(npx next:*)",
      "Bash(node:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git branch:*)",
      "Bash(git checkout:*)",
      "Bash(git fetch:*)",
      "Bash(git rebase:*)",
      "Bash(git check-ignore:*)",
      "Bash(gh pr:*)",
      "Bash(gh repo:*)",
      "Bash(gh auth status:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(rg:*)",
      "Bash(cat:*)",
      "Bash(mkdir:*)",
      "Bash(cd:*)",
      "Bash(touch:*)",
      "Bash(python3:*)",
      "WebFetch(domain:github.com)",
      "WebFetch(domain:playwright.dev)",
      "WebFetch(domain:supabase.com)",
      "WebFetch(domain:vercel.com)",
      "WebFetch(domain:api.anthropic.com)",
      "WebSearch",
      "mcp__context7__query-docs",
      "mcp__context7__resolve-library-id"
    ]
  },
```

- [ ] **Step 3: Валидировать JSON**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && python3 -c "import json; json.load(open('.claude/settings.local.json'))" && echo "OK"
```
Expected: `OK`

---

### Task 11: Sanity check — приложение всё ещё билдится

**Files:** none touched

- [ ] **Step 1: Lint**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && npm run lint
```
Expected: `0 errors`. Bootstrap не трогает TS/JS код, lint должен пройти как раньше.

- [ ] **Step 2: Build**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && npm run build 2>&1 | tail -20
```
Expected: build завершается без ошибок. Если падает — bootstrap здесь ни при чём (только конфиги/docs); fix application или откат к main.

---

### Task 12: Закоммитить bootstrap

**Files:**
- All new files from tasks 1-10

- [ ] **Step 1: Проверить статус**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && git status
```
Expected: untracked
- `.claude/commands/e2e-cycle.md`
- `autotests-plans/` (полная папка)
- `e2e/.env.example`
- `e2e/.gitkeep`

Modified:
- `.claude/settings.local.json`
- `.gitignore`

Untracked but **ignored** (НЕ должен появиться в git status или появится с `--ignored`):
- `e2e/.env`

- [ ] **Step 2: Stage относящиеся файлы**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && git add \
  .claude/commands/e2e-cycle.md \
  .claude/settings.local.json \
  .gitignore \
  autotests-plans/ \
  e2e/.env.example \
  e2e/.gitkeep \
  docs/superpowers/plans/2026-05-26-autonomous-e2e-bootstrap.md
```

(Спека `docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md` уже закоммичена ранее — `bc38b6b` + `6135b3a`.)

- [ ] **Step 3: Проверить, что `e2e/.env` НЕ застейджен**

```bash
git -C /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 diff --cached --name-only | grep -c "e2e/.env$"
```
Expected: `0` (никаких matches). Если выводит больше 0 — НЕ КОММИТИТЬ, разбираться.

Также проверь, что `.env.example` есть:
```bash
git -C /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 diff --cached --name-only | grep "e2e/.env"
```
Expected: только `e2e/.env.example`.

- [ ] **Step 4: Закоммитить**

```bash
git -C /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 commit -m "$(cat <<'EOF'
chore(e2e): bootstrap autonomous E2E test infrastructure

Sets up the scaffolding for a phase-based state machine that an Anthropic
scheduled-agent will execute (cron every 5h10m). This commit only contains
the orchestration plumbing — the actual Playwright project (e2e/package.json,
playwright.config.ts, tests, fixtures, POM) is created by the agent itself
in the SCAFFOLD phase on its first run.

What's included:
- autotests-plans/{README,glossary,driver-playbook}.md — agent's instructions
- autotests-plans/state/cycle-state.json — phase/area orchestration state
- e2e/.env.example + e2e/.gitkeep — placeholder for the Playwright project
- .claude/commands/e2e-cycle.md — manual /e2e-cycle slash command
- .claude/settings.local.json — updated allow-list (old /Desktop paths removed)
- .gitignore — e2e/ artifacts excluded

Full design: docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md
Implementation plan: docs/superpowers/plans/2026-05-26-autonomous-e2e-bootstrap.md

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 5: Подтвердить коммит**

```bash
git -C /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 log -1 --stat
```
Expected: commit hash + список изменённых файлов соответствует bootstrap'у.

---

### Task 13: Создать scheduled task

**Files:** none in repo (создаём external ресурс через MCP)

- [ ] **Step 1: Загрузить схему `mcp__scheduled-tasks__create_scheduled_task`**

```
ToolSearch tool, query: "select:mcp__scheduled-tasks__create_scheduled_task,mcp__scheduled-tasks__list_scheduled_tasks"
```

Прочесть схему. Определить точные имена полей: `cron`, `prompt`, `repo`/`repository`, `branch`/`base_branch`, секреты (`env`/`secrets`/`environment`).

- [ ] **Step 2: Создать scheduled task**

Вызвать `mcp__scheduled-tasks__create_scheduled_task` со следующими параметрами (мап на реальные поля схемы):

- **Имя/название:** `last-episode-e2e-autonomous-cycle`
- **Cron:** `10 */5 * * *` (запуски в 00:10, 05:10, 10:10, 15:10, 20:10 UTC)
- **Repo target:** GitHub origin репозитория last-episode (определить через `gh repo view --json nameWithOwner`)
- **Branch:** `e2e/autotests`
- **Prompt (триггер):**
  ```
  Прочитай autotests-plans/driver-playbook.md и выполни ровно одну итерацию цикла.
  Состояние: autotests-plans/state/cycle-state.json. Ветка: e2e/autotests.
  Заверши шаг полностью или поставь blocked.
  ```
- **Секреты (если схема поддерживает):**
  - `BASE_URL=https://www.episode.watch`
  - `FALLBACK_URL=https://last-episode.vercel.app`
  - `TEST_USER_EMAIL=hornysennin@gmail.com`
  - `TEST_USER_PASSWORD=QASenninMode94`
  - `HEADLESS=true`

Если поле секретов в схеме отсутствует — НЕ блокировать создание; зафиксировать в state-файле через `blocked: { reason: "secrets-mechanism-missing" }` после первого no-op запуска. Тогда юзеру понадобится положить креды в `e2e/.env.encrypted` (fallback из спеки) и расшифровывать в начале каждого run'а.

- [ ] **Step 3: Подтвердить создание**

```
mcp__scheduled-tasks__list_scheduled_tasks
```

Проверить, что задача `last-episode-e2e-autonomous-cycle` появилась в списке с правильным cron и веткой.

- [ ] **Step 4: Зафиксировать в спеке Open question #1**

Если выяснилось, что секреты поддерживаются (или не поддерживаются) — open question #1 в спеке (`docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md`) resolved. Не нужно править спеку прямо сейчас — это будет в follow-up коммите после первого успешного scheduled-run'а.

---

### Task 14: Push + open bootstrap PR

**Files:** none in repo

- [ ] **Step 1: Push текущей ветки на origin**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && git push -u origin claude/vibrant-shannon-807b24
```
Expected: успешный push, упоминание ссылки на создание PR в выводе.

- [ ] **Step 2a: Записать тело PR'а в `/tmp/bootstrap-pr-body.md`**

Use Write tool. Path: `/tmp/bootstrap-pr-body.md`
Content (валидный GitHub-flavored markdown; в плане выведен через 4-backtick fence, чтобы не конфликтовать с inner triple-backticks):

````markdown
## Summary

Setup плана для автономной разработки UI E2E тестов на Playwright + TypeScript. Этот PR создаёт **только инфраструктуру оркестровки** — сами тесты и Playwright-проект `e2e/*` будут созданы scheduled-agent'ом автоматически после merge.

## What's inside

- **`autotests-plans/`** — план/процесс/state:
  - `README.md` — entry point для человека (как читать прогресс)
  - `glossary.md` — терминология (phases, locator tiers, skills)
  - `driver-playbook.md` — что scheduled-agent делает на каждом запуске
  - `state/cycle-state.json` — orchestration state (фаза, область, очередь, blocked)
- **`e2e/`** — placeholder для Playwright проекта (`.env.example` + `.gitkeep`); scaffold создаст агент
- **`.claude/commands/e2e-cycle.md`** — slash-команда `/e2e-cycle` для ручного запуска цикла локально
- **`.claude/settings.local.json`** — обновлённый allow-list (старые `/Desktop` пути удалены)
- **`.gitignore`** — `e2e/` артефакты исключены

## Design and plan documents

- Дизайн: [docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md](docs/superpowers/specs/2026-05-26-autonomous-e2e-setup-design.md)
- План: [docs/superpowers/plans/2026-05-26-autonomous-e2e-bootstrap.md](docs/superpowers/plans/2026-05-26-autonomous-e2e-bootstrap.md)

## How it works after merge

1. После merge — создать ветку `e2e/autotests` из main:
   ```
   git checkout main && git pull
   git checkout -b e2e/autotests
   git push -u origin e2e/autotests
   ```
2. Scheduled task `last-episode-e2e-autonomous-cycle` (cron `10 */5 * * *`) уже создан и подхватит ветку с первого тика.
3. Первый run выполнит фазу `GLOBAL_EXPLORE` — создаст `coverage-roadmap.md` и заполнит `queue`.
4. Дальше — цикл по областям: AREA_EXPLORE → TEST_CASES → LOCATOR_AUDIT → IMPLEMENT → VERIFY → DOCUMENT → DONE (PR в main).
5. Прогресс смотреть в `autotests-plans/state/cycle-state.json` или в PR'ах от scheduled-agent'а.

## Test plan

- [x] `npm run lint` — 0 errors (no TS/JS modified)
- [x] `npm run build` — 0 errors (no TS/JS modified)
- [x] `cycle-state.json` валиден по JSON-схеме
- [x] `.claude/settings.local.json` валидный JSON
- [x] `e2e/.env` НЕ застейджен (только `.env.example`)
- [x] `git check-ignore e2e/.env` подтверждает игнор
- [ ] После merge — scheduled-agent выполняет GLOBAL_EXPLORE на первом тике
- [ ] После merge — `e2e/autotests` ветка создана и доступна на origin

## Notes for reviewer

- Все изменения — конфигурация и документация. **Никаких изменений TS/JS/SQL.**
- Кредами тест-юзера ты явно разрешил «спокойно загрязнять боевые данные» (pet-проект). Юзер `hornysennin@gmail.com` уже существует в боевом Supabase.
- Существующие hooks в `.claude/settings.local.json` (audio feedback) оставлены без изменений — они ссылаются на `/Desktop/projects/autotests/*.mp3` вне репо, `afplay` упадёт молча если файлов нет. Известный issue, решение оставлено тебе отдельно.
````

- [ ] **Step 2b: Открыть PR через `--body-file`**

```bash
cd /Users/hornysennin/projects/last-episode/.claude/worktrees/vibrant-shannon-807b24 && gh pr create --base main --head claude/vibrant-shannon-807b24 --title "chore(e2e): bootstrap autonomous E2E test infrastructure" --body-file /tmp/bootstrap-pr-body.md
```

Expected: вывод с URL созданного PR'а.

- [ ] **Step 3: Сохранить URL PR'а**

```bash
gh pr view --json url --jq .url
```

Записать URL — вернуть пользователю в финальном сообщении.

---

## Post-merge checklist (для пользователя, после merge bootstrap-PR'а)

Эти шаги — НЕ часть текущего плана, но нужны для активации цикла:

1. Merge bootstrap-PR в `main` (через GitHub UI).
2. Создать долгоживущую ветку `e2e/autotests`:
   ```
   git checkout main && git pull
   git checkout -b e2e/autotests
   git push -u origin e2e/autotests
   ```
3. Дождаться следующего scheduled-тика (≤ 5h10m). Первый запуск выполнит GLOBAL_EXPLORE.
4. (Опционально) запустить локально через `/e2e-cycle` чтобы не ждать cron.
