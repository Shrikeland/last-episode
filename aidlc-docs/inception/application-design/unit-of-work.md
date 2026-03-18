# Units of Work

## Deployment Model
**Monolith** — одно Next.js приложение, единый деплой на Vercel.
Units — логические модули разработки внутри одной кодовой базы.

---

## Unit 1: Foundation

**Описание**: Фундамент проекта — инфраструктура, аутентификация, базовые layouts, навигация.
Все последующие unit'ы зависят от этого unit'а.

**Компоненты**:
- `middleware.ts` — auth guard (защита всех /app/* роутов)
- `app/layout.tsx` — RootLayout (Geist fonts, Tailwind, tweakcn тема)
- `app/(auth)/layout.tsx` — AuthLayout
- `app/(auth)/login/page.tsx` — LoginPage
- `app/(auth)/register/page.tsx` — RegisterPage
- `app/(app)/layout.tsx` — AppLayout
- `components/Navbar.tsx` — навигация
- `lib/supabase/client.ts` — createServerClient / createBrowserClient
- `types/index.ts` — все shared TypeScript types
- `supabase/migrations/001_initial_schema.sql` — создание всех таблиц + RLS policies

**Deliverables**:
- Рабочая аутентификация (login/register/logout)
- Защищённые роуты (middleware редиректит на /login)
- Настроенная тема (tweakcn dark palette)
- База данных со всеми таблицами и RLS

---

## Unit 2: Media Library

**Описание**: Основная библиотека — добавление контента через TMDB, просмотр коллекции, фильтрация.

**Компоненты**:
- `app/(app)/library/page.tsx` — LibraryPage (Server Component)
- `app/(app)/search/page.tsx` — SearchPage
- `components/library/MediaCard.tsx`
- `components/library/MediaGrid.tsx`
- `components/library/FilterBar.tsx`
- `components/library/EmptyState.tsx`
- `components/search/SearchInput.tsx`
- `components/search/TmdbResultCard.tsx`
- `lib/tmdb/tmdb.service.ts` — TmdbService
- `lib/supabase/media.ts` — MediaService
- `app/actions/tmdb.ts` — Server Actions для TMDB
- `app/actions/media.ts` — Server Actions для media CRUD

**Deliverables**:
- Поиск тайтлов в TMDB и добавление в коллекцию
- Главная страница с сеткой карточек (Aceternity CardSpotlight)
- Фильтрация по статусу/типу/жанру/оценке + поиск по названию
- Удаление тайтла из коллекции

---

## Unit 3: Title Detail + Progress Tracking

**Описание**: Детальная страница тайтла, управление статусом/оценкой/заметками, отслеживание прогресса по сезонам и эпизодам.

**Компоненты**:
- `app/(app)/media/[id]/page.tsx` — MediaDetailPage (Server Component)
- `components/media/MediaPoster.tsx` (Aceternity Glow)
- `components/media/StatusSelect.tsx`
- `components/media/RatingInput.tsx`
- `components/media/NotesEditor.tsx`
- `components/media/SeasonAccordion.tsx`
- `components/media/EpisodeRow.tsx`
- `lib/supabase/progress.ts` — ProgressService
- `app/actions/progress.ts` — Server Actions для эпизодов
- `supabase/migrations/` — индексы на episodes.season_id, seasons.media_item_id

**Deliverables**:
- Детальная страница тайтла с постером и метаданными
- Смена статуса просмотра
- Оценка 1–10 и текстовые заметки с автосохранением
- Список сезонов с чекбоксами эпизодов
- "Отметить весь сезон" одним кликом
- Оптимистичные обновления (useOptimistic)

---

## Unit 4: Statistics

**Описание**: Страница статистики — подсчёт затраченного времени, разбивка по типу/статусу, топ жанры.

**Компоненты**:
- `app/(app)/stats/page.tsx` — StatsPage (Server Component)
- `components/stats/StatsOverview.tsx`
- `components/stats/StatsBreakdown.tsx`
- `components/stats/GenreTopList.tsx`
- `lib/stats.ts` — StatsService (pure functions)

**Deliverables**:
- Общее время просмотра ("X дней Y часов Z минут")
- Разбивка по типу контента (фильм/сериал/аниме)
- Разбивка по статусу
- Топ-5 жанров по количеству тайтлов

---

## Code Organization Strategy

```
/Users/hornysennin/Desktop/projects/last-episode/    ← workspace root
├── app/                   Next.js App Router
├── components/            React компоненты
├── lib/                   Сервисы и утилиты
├── types/                 Shared TypeScript types
├── middleware.ts           Auth guard
├── supabase/migrations/   SQL миграции
├── public/                Статические файлы
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

Приложение инициализируется командой `npx create-next-app@latest` с флагами TypeScript + Tailwind + App Router.
Существующие `src/index.ts`, `tsconfig.json`, `package.json` заменяются файлами Next.js проекта.