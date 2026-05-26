# Autonomous E2E Test Infrastructure — Design Spec

**Date:** 2026-05-26
**Author:** Claude (Opus 4.7) + horny sennin
**Status:** Draft → awaiting user review

## Goal

Дать Claude возможность автономно (без постоянных подтверждений от пользователя) писать UI E2E автотесты на Playwright + TypeScript для проекта `last-episode`, с автоматическим возобновлением после исчерпания 5-часового лимита API.

## Context

Проект `last-episode` — pet-проект на Next.js / Supabase, развёрнутый на Vercel (`https://www.episode.watch/` основной + `https://last-episode.vercel.app/` fallback). E2E-тестов сейчас нет: в `CLAUDE.md` описана матрица планируемых тестов, но ни одного `.spec.ts` файла не написано.

Пользователь хочет процесс из 7 шагов, повторяющийся для каждой логической области приложения:

1. EXPLORE (изучить область + сформировать план)
2. TEST_CASES (сгенерировать QA-документацию)
3. SCAFFOLD (one-time архитектура Playwright проекта)
4. IMPLEMENT (написать тесты)
5. VERIFY (прогнать до зелёного)
6. DOCUMENT (зафиксировать матрицу покрытия)
7. NEXT_AREA (очистить фокус, перейти к следующей области)

Ключевое требование автономии: при срабатывании 5-часового лимита Claude процесс должен возобновиться автоматически.

## Constraints

- **Никаких прав на новую инфраструктуру** — только Anthropic scheduled tasks и существующий git-workflow.
- **Никаких изменений основного приложения** — тесты гоняются против deployed Vercel-окружения. Backend (Supabase) — боевой, тестовый юзер.
- **Не ломать существующие правила репо** — `npm run build` / `npm run lint` должны оставаться зелёными в основном пайплайне; e2e живёт в отдельной папке с собственным `package.json`.
- **Локи версий из CLAUDE.md незыблемы** — `framer-motion@11.14.4`, `@supabase/supabase-js@2.46.2`, `motion-dom@11.14.3`. Playwright не должен принести конфликтующие транзитивные deps в основной lock.

## Design decisions (approved by user)

| Решение | Выбор |
|--------|------|
| Механизм автономии | Scheduled remote agents (`mcp__scheduled-tasks__*`) |
| Расположение Playwright | `e2e/` подпапка в основном репо, собственный `package.json` |
| Target тестов | Deployed Vercel URL + боевой Supabase + dedicated test user |
| Git-стратегия | Долгоживущая ветка `e2e/autotests`, периодические PR в main |
| Cron-частота | `10 */5 * * *` UTC (00:10, 05:10, 10:10, 15:10, 20:10) |
| Паттерн оркестровки | Phase-based state machine с subagents для параллельных подзадач внутри фазы |

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│  Anthropic Scheduled Tasks (cron: 10 */5 * * *)              │
│       │                                                       │
│       ▼                                                       │
│  Remote sandbox: git clone → checkout e2e/autotests          │
│  → cd e2e/ → npm ci → playwright install                     │
│       │                                                       │
│       ▼                                                       │
│  Trigger prompt → reads autotests-plans/driver-playbook.md   │
│  → reads autotests-plans/state/cycle-state.json              │
│       │                                                       │
│       ▼                                                       │
│  Phase dispatcher:                                            │
│    bootstrap.global_explore_done == false → GLOBAL_EXPLORE   │
│    bootstrap.scaffold_done == false      → SCAFFOLD          │
│    иначе → active.phase для active.area:                     │
│      AREA_EXPLORE → TEST_CASES → IMPLEMENT →                 │
│      VERIFY → DOCUMENT → DONE                                 │
│       │                                                       │
│       ▼                                                       │
│  Внутри фазы: при необходимости — Agent(...) subagents       │
│  (только для независимых файлов, чтобы не было конфликтов    │
│   при коммитах)                                              │
│       │                                                       │
│       ▼                                                       │
│  Apply state transition → commit на e2e/autotests             │
│  → (если область DONE) gh pr create в main → exit            │
└─────────────────────────────────────────────────────────────┘
```

Состояние процесса между запусками живёт в одном JSON-файле в репо. Каждый запуск scheduled-агента — изолированный sandbox; sandbox умирает в конце запуска, никакая память не сохраняется в нём, только в git.

## Folder & file layout

```
last-episode/                              # корень репо
├── e2e/                                   # NEW — Playwright проект
│   ├── package.json                       # отдельный pkg, свои deps
│   ├── tsconfig.json
│   ├── playwright.config.ts
│   ├── .env.example                       # шаблон, в git
│   ├── .env                               # реальные секреты, .gitignore
│   ├── README.md                          # как локально запустить
│   ├── tests/
│   │   └── <area>/*.spec.ts
│   ├── fixtures/                          # auth state, ctx
│   ├── pages/                             # Page Object Model
│   └── support/                           # helpers, data builders
│
├── autotests-plans/                       # NEW — план/процесс
│   ├── README.md
│   ├── driver-playbook.md                 # длинные инструкции для агента
│   ├── glossary.md
│   ├── coverage-roadmap.md                # создаётся агентом в GLOBAL_EXPLORE
│   ├── state/
│   │   └── cycle-state.json               # source of truth для оркестровки
│   └── areas/<area>/
│       ├── 01-exploration.md
│       ├── 02-test-cases.md
│       ├── 03-implementation.md
│       └── 04-coverage-matrix.md
│
├── .claude/
│   ├── settings.local.json                # обновлённый allow-list
│   └── commands/
│       └── e2e-cycle.md                   # /e2e-cycle slash-команда
│
└── .gitignore                             # дополнен e2e/-исключениями
```

**Принципы раскладки:**

1. **Тесты и план разнесены физически.** `e2e/` — исполняемый артефакт (Playwright). `autotests-plans/` — процесс и документация.
2. **Один файл на шаг цикла** в `autotests-plans/areas/<area>/` — даёт «след» работы и контекст для следующих фаз.
3. **`cycle-state.json` — единственный изменяемый источник истины** для оркестровки. Всё остальное в `autotests-plans/` append-mostly.
4. **`.claude/commands/e2e-cycle.md`** даёт slash-команду `/e2e-cycle` для ручного запуска цикла локально (escape hatch).

## State machine

### `cycle-state.json` schema

```json
{
  "schema_version": "1.0",
  "updated_at": "2026-05-26T03:00:00Z",
  "updated_by": "agent-run-<id>",

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

  "last_run": {
    "run_id": "agent-run-<id>",
    "started_at": "2026-05-26T03:00:00Z",
    "ended_at": "2026-05-26T03:42:00Z",
    "phase_in": "GLOBAL_EXPLORE",
    "phase_out": "SCAFFOLD",
    "commits": ["<sha>"],
    "summary": "1-2 строки что сделано"
  }
}
```

Поля:

- **`bootstrap.global_explore_done`** — выполнен ли первоначальный обход приложения и создан ли `coverage-roadmap.md`.
- **`bootstrap.scaffold_done`** — создан ли Playwright проект в `e2e/`.
- **`active.area`** — текущая область (`null` пока bootstrap не завершён).
- **`active.phase`** — текущая фаза цикла (см. список ниже).
- **`queue`** — упорядоченный список областей, ещё не покрытых.
- **`completed_areas`** — упорядоченный список областей с DONE.
- **`blocked`** — `null` или `{ reason: string, area?: string, suggestion?: string, needs_human: boolean }`. При наличии `blocked.needs_human === true` следующие scheduled-runs выходят no-op (~30 сек).
- **`last_run`** — краткий след для отладки.

### Phases

| Phase | Что делает | Acceptance |
|-------|-----------|-----------|
| `GLOBAL_EXPLORE` | Изучает приложение целиком, формирует приоритеты | `coverage-roadmap.md` + заполненный `queue` |
| `SCAFFOLD` | Создаёт Playwright проект в `e2e/` (один раз) | `e2e/package.json`, `playwright.config.ts`, smoke-тест зелёный |
| `AREA_EXPLORE` | Исследует одну область приложения | `areas/<area>/01-exploration.md` |
| `TEST_CASES` | Пишет QA-кейсы через `qa-test-planner` | `areas/<area>/02-test-cases.md` |
| `IMPLEMENT` | Пишет Playwright тесты | файлы в `e2e/tests/<area>/` + `03-implementation.md` |
| `VERIFY` | Прогоняет тесты до зелёного | 2 последовательных зелёных run |
| `DOCUMENT` | Заполняет coverage matrix | `areas/<area>/04-coverage-matrix.md` без MISSING/PARTIAL |
| `DONE` | Открывает PR, область → `completed_areas` | PR создан, state обновлён |
| `IDLE` | Все области покрыты | `blocked: { reason: "all-areas-complete" }`, no-op runs |

### Phase transitions

```
[start] → GLOBAL_EXPLORE → SCAFFOLD → ┐
                                       ▼
                              AREA_EXPLORE
                                       │
                                       ▼
                                  TEST_CASES
                                       │
                                       ▼
                                  IMPLEMENT
                                       │
                                       ▼
                                   VERIFY ───(red)──→ IMPLEMENT
                                       │
                                       │(green×2)
                                       ▼
                                  DOCUMENT
                                       │
                                       ▼
                                     DONE
                                       │
                                       ▼
                              (queue empty?) ──yes──→ IDLE
                                       │ no
                                       ▼
                                AREA_EXPLORE (next area)
```

**Anti-flake rule:** переход VERIFY → DOCUMENT требует 2 последовательных зелёных прогона тестов области, чтобы отсечь intermittent падения.

**Escalation rule:** если VERIFY падает 3 раза подряд с одной и той же причиной — агент ставит `blocked: { reason: "verify-stuck", area, suggestion }` и выходит. Cron-runs становятся no-op до ручного вмешательства.

## Driver playbook (что лежит в `autotests-plans/driver-playbook.md`)

```markdown
# Autonomous E2E Driver Playbook

## Роль
Ты — autonomous E2E test author проекта last-episode. Ты работаешь по фазовому
циклу, в одной области за раз. Каждый scheduled-запуск выполняет максимум одну
фазу и заканчивается коммитом.

## Алгоритм каждого запуска
1. `cd e2e/ && npm ci && npx playwright install --with-deps chromium`
   (если e2e/ не существует — пропусти, ты в фазе GLOBAL_EXPLORE/SCAFFOLD).
2. Прочитай `autotests-plans/state/cycle-state.json`.
3. Если `blocked.needs_human === true` → выйди без работы.
4. Phase dispatcher:
   - `bootstrap.global_explore_done === false` → GLOBAL_EXPLORE
   - `bootstrap.scaffold_done === false` → SCAFFOLD
   - иначе → `active.phase` для `active.area`
5. Выполни фазу до acceptance criteria.
6. Обнови `cycle-state.json` (advance phase или area или ставь blocked).
7. `git add -A && git commit -m "<conv-commit>" && git push`
8. Если фаза DONE и область завершена — `gh pr create --base main --head e2e/autotests`.
9. Выход.

## Playbook по фазам

### GLOBAL_EXPLORE
- Используй `superpowers:brainstorming` для обхода `app/(app)/*` и формирования
  приоритизированной очереди областей по эвристике (см. секцию ниже).
- Артефакт: `autotests-plans/coverage-roadmap.md`.
  Структура: цель, области, обоснование приоритета, риски, MVP-критерии.
- Заполни `queue` в state.
- Если приоритизация спорная — открой PR с roadmap'ом и поставь
  `blocked: { reason: "roadmap-review-requested" }`.

### SCAFFOLD (один раз)
- Используй `1.1:playwright-best-practices`.
- Создай минимальный, но scalable Playwright проект:
  - `e2e/package.json` (Playwright latest, `@playwright/test`, `dotenv`, `zod`)
  - `playwright.config.ts` с `webServer` отключён, `baseURL` из env, ретраи=2,
    `trace: "retain-on-failure"`, `screenshot: "only-on-failure"`,
    `video: "retain-on-failure"`, проекты для chromium / firefox / webkit
    (включён только chromium на старте).
  - `tsconfig.json` strict, paths alias `@/*` → `./`
  - Структура: `fixtures/`, `pages/`, `support/`, `tests/`
  - `.env.example` с плейсхолдерами
  - `README.md` с локальной командой запуска
- Smoke-тест: открыть `process.env.BASE_URL` и проверить `<title>`.
- Запустить `npx playwright test` — должен пройти зелёным.
- Закоммитить и обновить `bootstrap.scaffold_done = true`.

### AREA_EXPLORE
- Прочти `app/(app)/<area>/`, `app/actions/<area>.ts`, `lib/<area>*.ts`.
- Если применимо — `lib/supabase/<area>*.ts`, `types/index.ts`.
- Сформируй `autotests-plans/areas/<area>/01-exploration.md`:
  - Цель области (user goal).
  - Карта компонентов и server actions.
  - Пользовательские сценарии (happy path + edge cases).
  - Внешние зависимости (TMDB, Groq, и т.д.).
  - Риски и open questions.
- Не пиши тесты на этой фазе — только разведка.

### TEST_CASES
- Используй `qa-test-planner` для генерации тест-кейсов из 01-exploration.md.
- Артефакт: `autotests-plans/areas/<area>/02-test-cases.md`.
- Каждый кейс:
  - `id`, `title`, `priority` (P0/P1/P2)
  - `preconditions` (что должно быть в системе перед стартом)
  - `steps` (numbered, действия пользователя)
  - `expected_result` (что должно произойти)
  - `test_data` (какие данные нужны)
  - `automation_status` (initial: NOT_AUTOMATED)
- Кейсы должны быть пригодны и для ручного QA, и для Playwright реализации.

### IMPLEMENT
- Используй `1.1:playwright-best-practices` для каждого нового файла.
- Page Object Model:
  - Один `<Area>Page` класс на каждую страницу/раздел в `pages/`.
  - Селекторы preferentially через `getByRole`, `getByLabel`, `getByTestId`.
- Fixtures:
  - `auth.fixture.ts` логинится один раз через UI и сохраняет storageState.
  - `data.fixture.ts` для тестовых данных (если применимо).
- Если паттерн повторяется (например, типовой POM, общий helper) — используй
  `skill-creator` для написания внутреннего скилла, если он переиспользуется
  ≥2 раза.
- Subagents (через `Agent` tool):
  - Используй ТОЛЬКО для независимых файлов в одной области (например, 4 теста
    в `tests/<area>/`, каждый — свой `.spec.ts`).
  - Каждый subagent получает один файл; они не делят state и не пишут в
    одну папку pages/.
- Артефакты:
  - `e2e/tests/<area>/*.spec.ts` — по одному файлу на feature внутри области
    (например, `library/add-title.spec.ts`, `library/delete-title.spec.ts`).
  - `autotests-plans/areas/<area>/03-implementation.md` — карта файлов:
    кейс из 02 → файл/тест → краткое описание стратегии.

### VERIFY
- `cd e2e && npx playwright test tests/<area> --reporter=list,html`
- Используй `verify` skill для интерпретации результатов.
- При падении:
  - Падение детерминированное и в логике приложения → `blocked: { reason: "app-bug", area, suggestion }`
  - Падение в тесте → используй `systematic-debugging`, фикси, перезапускай.
  - Падение flaky (один прогон красный, другой зелёный) → расследуй через
    `1.1:playwright-best-practices` (waitForLoadState, locator strategies,
    retry config, timing assertions).
- Acceptance: 2 последовательных зелёных прогона (анти-флак). Если первый
  зелёный, второй красный — это flake, фикси и перезапускай (НЕ переходи в
  DOCUMENT). Между прогонами достаточно `npx playwright test tests/<area>`
  ещё раз; переустанавливать deps не нужно.
- Если 3 прогона подряд падают с одной и той же причиной — `blocked` + exit.

### DOCUMENT
- Используй `qa-test-planner` для генерации coverage matrix.
- Артефакт: `autotests-plans/areas/<area>/04-coverage-matrix.md`:
  - Таблица: `case_id | title | priority | status | spec_file | last_green_at`
  - `status`: COVERED | MISSING | PARTIAL | SKIPPED
  - Все COVERED — это passing tests. Никаких MISSING или PARTIAL для DONE.
- Обнови `coverage-roadmap.md` (статус области: ✅).

### DONE
- `gh pr create --base main --head e2e/autotests --title "test(e2e/<area>): coverage" --body "..."`
- Body PR'а: ссылки на все 4 артефакта области + сводка покрытия.
- В state: `active.area → completed_areas`, `active.phase = AREA_EXPLORE`,
  `active.area = queue.shift()`. Если queue пуста → IDLE.

### IDLE
- `cycle-state.json` финальный:
  ```
  active.phase = "IDLE"
  blocked = { reason: "all-areas-complete", needs_human: true }
  ```
- Открой финальный PR с обновлённым `coverage-roadmap.md` (статусы ✅ всем).
- Последующие cron-runs увидят `blocked.needs_human === true` и выйдут no-op.

## Эвристика приоритизации (для GLOBAL_EXPLORE)

Тир 0: критический путь (без области приложение не работает).
Тир 1: основной флоу (>50% пользовательских сценариев).
Тир 2: расширенный функционал.
Тир 3: сложный/нестабильный (LLM, внешние API).

Внутри тира — простые тесты раньше сложных (быстрый feedback).
```

## Permissions, secrets, hooks

### Permissions (`.claude/settings.local.json`)

Полная замена `allow`:

```json
"allow": [
  "Bash(npm:*)",
  "Bash(npm ci:*)",
  "Bash(npx playwright:*)",
  "Bash(npx tsc:*)",
  "Bash(npx eslint:*)",
  "Bash(npx supabase:*)",
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
  "Bash(gh pr:*)",
  "Bash(gh repo:*)",
  "Bash(gh auth status:*)",
  "Bash(ls:*)",
  "Bash(find:*)",
  "Bash(rg:*)",
  "Bash(cat:*)",
  "Bash(mkdir:*)",
  "Bash(cd:*)",
  "WebFetch(domain:github.com)",
  "WebFetch(domain:playwright.dev)",
  "WebFetch(domain:supabase.com)",
  "WebFetch(domain:vercel.com)",
  "WebSearch",
  "mcp__context7__query-docs",
  "mcp__context7__resolve-library-id"
]
```

Существующие hooks (audio feedback) остаются без изменений — они не мешают автономной работе, поскольку scheduled-agent работает в remote sandbox без hooks.

### Secrets

`e2e/.env` (gitignored):

```
BASE_URL=https://www.episode.watch
FALLBACK_URL=https://last-episode.vercel.app
TEST_USER_EMAIL=hornysennin@gmail.com
TEST_USER_PASSWORD=QASenninMode94
HEADLESS=true
```

`e2e/.env.example` (в git):

```
BASE_URL=https://www.episode.watch
FALLBACK_URL=https://last-episode.vercel.app
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
HEADLESS=true
```

Для scheduled-agent'а креды передаются через `secrets` поле задачи (точное название поля — будет уточнено при загрузке схемы `mcp__scheduled-tasks__create_scheduled_task`).

### `.gitignore` дополнения

```
e2e/node_modules/
e2e/.env
e2e/playwright-report/
e2e/test-results/
e2e/blob-report/
```

## Slash command `/e2e-cycle`

`.claude/commands/e2e-cycle.md`:

```markdown
---
description: Run one iteration of the autonomous E2E cycle locally (same as scheduled-agent does)
---

You are entering the autonomous E2E cycle for this iteration.

Read `autotests-plans/driver-playbook.md` and execute exactly one phase
of the cycle, then commit the result on branch `e2e/autotests` and stop.

State: `autotests-plans/state/cycle-state.json`
Working dir: repo root

Begin.
```

Это даёт пользователю ручной «escape hatch»: если cron не сработал или хочется срочно догнать один шаг — `/e2e-cycle` запускает локально то же, что делает scheduled-agent.

## One-time bootstrap (что я делаю в текущей сессии)

Последовательность:

```
1. Создать структуру каталогов:
   • autotests-plans/{state,areas,}
   • autotests-plans/README.md
   • autotests-plans/glossary.md
   • autotests-plans/driver-playbook.md (полное содержимое выше)
   • autotests-plans/state/cycle-state.json (initial)

2. Создать e2e/ placeholder:
   • e2e/.env (с реальными кредами)
   • e2e/.env.example (с плейсхолдерами)
   • e2e/.gitkeep
   (Сам Playwright-проект агент создаст в фазе SCAFFOLD.)

3. Обновить .gitignore:
   • добавить e2e/{node_modules,.env,playwright-report,test-results,blob-report}

4. Заменить allow-list в .claude/settings.local.json
   (старые /Desktop пути удалить, новые из секции выше добавить).

5. Создать .claude/commands/e2e-cycle.md.

6. Закоммитить bootstrap на ветке claude/vibrant-shannon-807b24:
   conventional commit:
   "chore(e2e): bootstrap autonomous E2E test infrastructure"

7. Создать scheduled task через mcp__scheduled-tasks__create_scheduled_task:
   • cron: "10 */5 * * *"
   • prompt: компактный trigger (Read driver-playbook, do one iteration)
   • repo target: last-episode (origin)
   • branch: e2e/autotests
   • secrets: BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, FALLBACK_URL, HEADLESS

8. Открыть bootstrap-PR из claude/vibrant-shannon-807b24 → main.

9. Документировать в PR'е: что внутри, как стартует процесс, где смотреть прогресс.
```

После merge bootstrap-PR'а (вручную пользователем):

```
10. Создать ветку e2e/autotests из main.
11. Push. Scheduled-agent с первого тика встанет на неё.
```

## Acceptance criteria для bootstrap

Bootstrap считается успешным когда:

- [ ] Все каталоги и файлы из секции «folder layout» существуют (минус то, что создаёт агент).
- [ ] `cycle-state.json` валиден по schema, `bootstrap.global_explore_done=false`, `bootstrap.scaffold_done=false`.
- [ ] `.gitignore` дополнен.
- [ ] `.claude/settings.local.json` обновлён.
- [ ] `.claude/commands/e2e-cycle.md` создан.
- [ ] Scheduled task создана, cron активен, секреты прокинуты.
- [ ] Bootstrap PR открыт.
- [ ] README в `autotests-plans/` объясняет человеку, как читать состояние и где смотреть прогресс.

## First-cycle behaviour (что произойдёт после merge bootstrap'а)

1. **Первый scheduled-run** (или ручной `/e2e-cycle`): фаза `GLOBAL_EXPLORE`.
   Агент изучает приложение, создаёт `coverage-roadmap.md` с очередью областей, ставит `bootstrap.global_explore_done = true`, коммит.

2. **Второй scheduled-run**: фаза `SCAFFOLD`.
   Агент создаёт Playwright проект, smoke-тест зелёный, `bootstrap.scaffold_done = true`, коммит.

3. **С третьего run'а**: цикл по областям в порядке `queue`. Каждый run = одна фаза первой области.

При cadence `10 */5 * * *` это даёт ~5 фаз/сутки. Покрытие одной области занимает 5 фаз (AREA_EXPLORE → DOCUMENT), т.е. ~1 область в сутки в идеальном сценарии, замедляясь при VERIFY-падениях.

## Out of scope

- **GitHub Actions CI** для регрессионного прогона при каждом PR в main. Можно добавить позже как отдельный scheduled task `e2e-regression`.
- **Visual regression testing.** Snapshots / `toHaveScreenshot()` — пока за скоупом.
- **Accessibility / axe-core** интеграция — будущий тир.
- **Performance / Web Vitals** в тестах — будущий тир.
- **Multi-browser matrix.** SCAFFOLD создаёт конфиг с проектами chromium/firefox/webkit, но активен только chromium. Расширение — отдельная задача.
- **Программное создание тест-юзеров через Supabase Admin API.** Используем существующего юзера.
- **Тестирование RLS / админских функций.** Тестируем поведение «обычного» юзера.

## Open questions / risks

1. **API `mcp__scheduled-tasks__create_scheduled_task`** — точные имена полей (особенно `secrets`/env). Проверю при реализации; если механизма передачи секретов нет — fallback через encrypted `.env.encrypted` в репо.
2. **Vercel rate-limits.** При cadence 5/сутки и нескольких logins/area прогрев боевого Supabase должен быть безопасным, но если упрёмся — переход на webServer (локальный `next dev` в sandbox).
3. **Стабильность LLM-streaming тестов (рекомендации).** Эти тесты могут быть фундаментально flaky из-за реальных Groq вызовов. Возможно понадобятся API-моки на route-level — отложим до фазы IMPLEMENT для области `recommendations`.
4. **Существующие hooks** в `.claude/settings.local.json` ссылаются на `/Users/hornysennin/Desktop/projects/autotests/.claude/hooks/*.mp3` — путь вне репо. Если файлов нет, `afplay` молча падает (не блокирует). Известный issue, решение оставлено пользователю.
5. **Конфликт версий TypeScript.** В корневом `package.json` уже `typescript@^5`, в `e2e/package.json` будет своя строгая версия (5.7+). Изолированный `node_modules` в `e2e/` должен предотвратить hoisting-конфликты, но если npm workspaces включится по умолчанию — добавим `"workspaces"` явно или используем pnpm для e2e/.

## Next steps after this spec

1. **Self-review** этой спеки (Claude, inline).
2. **User review** этой спеки (горизонт ответа: одобрить/запросить правки).
3. После одобрения — `superpowers:writing-plans` для конвертации спеки в пошаговый implementation plan.
4. После plan'а — реализация bootstrap'а в этой же сессии (или в отдельной по решению пользователя).
