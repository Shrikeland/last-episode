# Execution Plan

## Detailed Analysis Summary

### Change Impact Assessment
- **User-facing changes**: Yes — полноценное веб-приложение с UI с нуля
- **Structural changes**: Yes — вся архитектура создаётся заново (Next.js App Router, Supabase, TMDB)
- **Data model changes**: Yes — 4 таблицы: media_items, seasons, episodes + Supabase Auth
- **API changes**: Yes — Next.js Route Handlers для TMDB proxy, Supabase клиент
- **NFR impact**: Yes — RLS, Vercel деплой, tweakcn тема, Aceternity UI

### Risk Assessment
- **Risk Level**: Medium
- **Rollback Complexity**: Easy (greenfield, нет существующих данных)
- **Testing Complexity**: Moderate (интеграция TMDB API + Supabase + Auth)

---

## Units of Work

Проект декомпозирован на 4 независимых unit'а, каждый завершается полностью (дизайн + код) перед следующим:

| Unit | Название | Описание |
|---|---|---|
| 1 | Foundation | Next.js setup, Supabase client, Auth (login/register), layout, protected routes |
| 2 | Media Library | TMDB search, добавление тайтлов, коллекция (сетка карточек), поиск+фильтрация |
| 3 | Title Detail + Progress | Страница тайтла, сезоны/эпизоды, прогресс просмотра, оценка, заметки |
| 4 | Statistics | Страница /stats, подсчёт времени, разбивка по типу/статусу, топ жанры |

---

## Workflow Visualization

```
INCEPTION PHASE
  [x] Workspace Detection         COMPLETED
  [x] Requirements Analysis       COMPLETED
  [ ] User Stories                SKIP
  [x] Workflow Planning           IN PROGRESS
  [ ] Application Design          EXECUTE
  [ ] Units Generation            EXECUTE

CONSTRUCTION PHASE (per unit x4)
  [ ] Functional Design           EXECUTE
  [ ] NFR Requirements            SKIP
  [ ] NFR Design                  SKIP
  [ ] Infrastructure Design       EXECUTE
  [ ] Code Generation             EXECUTE

  [ ] Build and Test              EXECUTE (after all units)

OPERATIONS PHASE
  [ ] Operations                  PLACEHOLDER
```

---

## Phases to Execute

### INCEPTION PHASE

- [x] Workspace Detection — COMPLETED
- [x] Requirements Analysis — COMPLETED
- [ ] User Stories — **SKIP**
  - **Rationale**: Личный проект, один пользователь, одна персона. User stories не добавляют ценности для solo-разработки.
- [x] Workflow Planning — IN PROGRESS
- [ ] Application Design — **EXECUTE**
  - **Rationale**: Новое приложение с нуля. Нужно определить дерево компонентов Next.js, страницы/роуты, сервисный слой (TmdbService, SupabaseService), shared types — до генерации кода.
- [ ] Units Generation — **EXECUTE**
  - **Rationale**: 4 чётких unit'а с разными зонами ответственности. Декомпозиция обеспечит фокусированную генерацию кода по частям.

### CONSTRUCTION PHASE (повторяется для каждого из 4 unit'ов)

- [ ] Functional Design — **EXECUTE** (per unit)
  - **Rationale**: Новые data models, бизнес-логика (runtime calculation, episode tracking, фильтрация). Детальный дизайн необходим.
- [ ] NFR Requirements — **SKIP**
  - **Rationale**: Tech stack полностью определён в requirements. NFR (RLS, Vercel, performance) уже задокументированы.
- [ ] NFR Design — **SKIP**
  - **Rationale**: NFR Requirements пропущен — этот этап не применяется.
- [ ] Infrastructure Design — **EXECUTE** (per unit)
  - **Rationale**: Supabase schema + RLS policies + миграции для каждого unit'а. Конфигурация Vercel env vars.
- [ ] Code Generation — **EXECUTE** (per unit, ALWAYS)
- [ ] Build and Test — **EXECUTE** (ALWAYS, после всех unit'ов)

### OPERATIONS PHASE
- [ ] Operations — PLACEHOLDER

---

## Success Criteria

- **Primary Goal**: Рабочее MVP-приложение задающее прочный фундамент для дальнейшего развития
- **Key Deliverables**:
  - Next.js приложение с аутентификацией
  - Интеграция TMDB API (поиск + метаданные)
  - Коллекция тайтлов с прогрессом по эпизодам
  - Страница статистики с подсчётом времени
  - Деплой на Vercel + Supabase Cloud
  - Dark UI в стиле "Naruto grown-up" (tweakcn + Aceternity UI)
- **Quality Gates**:
  - Supabase RLS — пользователь видит только свои данные
  - TypeScript strict mode — no any
  - Все env vars в .env.local / Vercel env (не в коде)
  - Миграции через Supabase CLI (не ручные изменения)