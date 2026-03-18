# Component Dependencies

## Dependency Matrix

| Component | Depends On | Communication Pattern |
|---|---|---|
| LoginPage | Supabase Browser Client | Direct call → signInWithPassword |
| RegisterPage | Supabase Browser Client | Direct call → signUp |
| LibraryPage (RSC) | MediaService, FilterBar, MediaGrid | Server fetch → props |
| SearchPage | Server Action: searchTmdb, addMediaItem | Server Action call |
| MediaDetailPage (RSC) | MediaService, ProgressService | Server fetch → props |
| StatsPage (RSC) | MediaService, ProgressService, StatsService | Server fetch → pure function |
| AppLayout | Navbar | Composition |
| Navbar | Supabase Browser Client | Direct call → signOut |
| MediaGrid | MediaCard | Composition |
| MediaCard | (stateless) | Props only |
| FilterBar | URL Search Params | Read/write URL |
| SeasonAccordion | EpisodeRow, Server Action: markSeasonWatched | Composition + Server Action |
| EpisodeRow | Server Action: toggleEpisodeWatched | Server Action call |
| StatusSelect | Server Action: updateMediaStatus | Server Action call |
| RatingInput | Server Action: updateRatingAndNotes | Server Action call |
| NotesEditor | Server Action: updateRatingAndNotes | Server Action call (debounced) |
| StatsOverview | (stateless) | Props only |
| StatsBreakdown | (stateless) | Props only |
| GenreTopList | (stateless) | Props only |

---

## Data Flow Diagram

```
Browser                    Next.js Server              External
   |                            |                          |
   |-- GET /library ----------->|                          |
   |                            |-- Supabase query ------->|
   |                            |<-- media_items[] --------|
   |<-- HTML (MediaGrid) -------|                          |
   |                            |                          |
   |-- Server Action: -------->|                          |
   |   searchTmdb(query)        |-- TMDB API GET --------->|
   |                            |<-- results[] ------------|
   |<-- TmdbSearchResult[] -----|                          |
   |                            |                          |
   |-- Server Action: -------->|                          |
   |   addMediaItem(tmdbId)     |-- TMDB API GET (detail)->|
   |                            |<-- TmdbDetails ----------|
   |                            |-- Supabase INSERT ------->|
   |                            |<-- MediaItem ------------|
   |<-- MediaItem --------------|                          |
   |                            |                          |
   |-- Server Action: -------->|                          |
   |   toggleEpisodeWatched()   |-- Supabase UPDATE ------->|
   |                            |<-- ok ------------------|
   |<-- void (optimistic UI) ---|                          |
```

---

## File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          -- LoginPage
│   │   └── register/page.tsx       -- RegisterPage
│   ├── (app)/
│   │   ├── layout.tsx              -- AppLayout + Navbar
│   │   ├── library/page.tsx        -- LibraryPage (RSC)
│   │   ├── search/page.tsx         -- SearchPage
│   │   ├── media/[id]/page.tsx     -- MediaDetailPage (RSC)
│   │   └── stats/page.tsx          -- StatsPage (RSC)
│   ├── actions/
│   │   ├── tmdb.ts                 -- Server Actions: TMDB
│   │   ├── media.ts                -- Server Actions: media CRUD
│   │   └── progress.ts             -- Server Actions: episode tracking
│   └── layout.tsx                  -- RootLayout
│
├── components/
│   ├── library/
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   └── FilterBar.tsx
│   ├── search/
│   │   ├── SearchInput.tsx
│   │   └── TmdbResultCard.tsx
│   ├── media/
│   │   ├── MediaPoster.tsx
│   │   ├── StatusSelect.tsx
│   │   ├── RatingInput.tsx
│   │   ├── NotesEditor.tsx
│   │   ├── SeasonAccordion.tsx
│   │   └── EpisodeRow.tsx
│   ├── stats/
│   │   ├── StatsOverview.tsx
│   │   ├── StatsBreakdown.tsx
│   │   └── GenreTopList.tsx
│   └── ui/                         -- shadcn/ui компоненты
│
├── lib/
│   ├── tmdb/
│   │   └── tmdb.service.ts         -- TmdbService
│   ├── supabase/
│   │   ├── client.ts               -- createServerClient / createBrowserClient
│   │   ├── media.ts                -- MediaService
│   │   └── progress.ts             -- ProgressService
│   └── stats.ts                    -- StatsService (pure functions)
│
├── types/
│   └── index.ts                    -- все shared TypeScript types
│
├── middleware.ts                    -- auth guard
│
└── supabase/
    └── migrations/                  -- SQL миграции
```

---

## Key Architectural Decisions

| Решение | Выбор | Обоснование |
|---|---|---|
| TMDB API ключ | Server-only (Server Actions) | Не expose в браузер |
| State management | URL params + local useState | Достаточно для MVP, shareable URLs для фильтров |
| Auth guard | Next.js middleware | Централизованная защита всех /app/* роутов |
| Supabase клиент | @supabase/ssr | Правильная работа с cookies в App Router |
| Оптимистичные обновления | useOptimistic (React 19) | Встроен в React, нет внешних зависимостей |
| Anime-определение | genre_id=16 + origin_country=JP | Стандартный TMDB подход |