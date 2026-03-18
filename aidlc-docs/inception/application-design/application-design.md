# Application Design — Consolidated

## Project: Last Episode — Personal Media Tracker
**Future domain**: episode.watch

---

## Architecture Summary

**Pattern**: Next.js 14 App Router, Server Components + Client islands, Server Actions для мутаций.

**Key Decisions**:
- TMDB API key — только сервер (Server Actions)
- Auth — Supabase Auth + @supabase/ssr + Next.js middleware
- State — URL search params для фильтров, local useState для UI-стейта
- Оптимистичные обновления — React 19 `useOptimistic` для чекбоксов эпизодов
- Anime-тип — определяется через TMDB genre_id=16 + origin_country=JP

---

## Pages & Routes

| Route | Component | Type | Назначение |
|---|---|---|---|
| /login | LoginPage | Client | Вход email+password |
| /register | RegisterPage | Client | Регистрация |
| /library | LibraryPage | Server | Сетка карточек коллекции |
| /search | SearchPage | Client | TMDB-поиск и добавление |
| /media/[id] | MediaDetailPage | Server | Тайтл + прогресс по сезонам |
| /stats | StatsPage | Server | Статистика просмотра |

Все роуты кроме /login и /register защищены через `middleware.ts`.

---

## Component Tree

```
RootLayout
├── (auth)/layout  [AuthLayout]
│   ├── /login     [LoginPage]
│   └── /register  [RegisterPage]
└── (app)/layout   [AppLayout]
    ├── Navbar
    ├── /library   [LibraryPage]
    │   ├── FilterBar
    │   └── MediaGrid
    │       └── MediaCard (x N)
    ├── /search    [SearchPage]
    │   ├── SearchInput
    │   └── TmdbResultCard (x N)
    ├── /media/[id] [MediaDetailPage]
    │   ├── MediaPoster
    │   ├── StatusSelect
    │   ├── RatingInput
    │   ├── NotesEditor
    │   └── SeasonAccordion (x seasons)
    │       └── EpisodeRow (x episodes)
    └── /stats     [StatsPage]
        ├── StatsOverview
        ├── StatsBreakdown
        └── GenreTopList
```

---

## Services Overview

| Service | Слой | Назначение |
|---|---|---|
| TmdbService | Server only | TMDB API wrapper (search, details, episodes) |
| MediaService | Server (SSR+RSC) | CRUD media_items в Supabase |
| ProgressService | Server (SSR+RSC) | Seasons/episodes CRUD + watched state |
| StatsService | Pure functions | Вычисление статистики из данных |

**Server Actions** (`/app/actions/`) — мост между Client Components и серверными сервисами:
- `tmdb.ts` — searchTmdb, getTmdbDetails, getTmdbSeasons
- `media.ts` — addMediaItem, updateMediaStatus, updateRatingAndNotes, deleteMediaItem
- `progress.ts` — toggleEpisodeWatched, markSeasonWatched

---

## Data Model

```
auth.users (Supabase Auth)
    |
    | 1:N
    v
media_items
    id              uuid PK
    user_id         uuid FK → auth.users
    tmdb_id         integer
    type            enum(movie, tv, anime)
    title           text
    original_title  text
    overview        text
    poster_url      text nullable
    release_year    integer nullable
    genres          jsonb (string[])
    status          enum(watching,completed,planned,dropped,on_hold)
    rating          integer nullable (1-10)
    notes           text nullable
    runtime_minutes integer nullable  [фильм]
    created_at      timestamptz
    updated_at      timestamptz
    |
    | 1:N
    v
seasons
    id              uuid PK
    media_item_id   uuid FK → media_items (CASCADE DELETE)
    tmdb_season_id  integer
    season_number   integer
    name            text
    episode_count   integer
    |
    | 1:N
    v
episodes
    id              uuid PK
    season_id       uuid FK → seasons (CASCADE DELETE)
    tmdb_episode_id integer
    episode_number  integer
    name            text
    runtime_minutes integer nullable
    is_watched      boolean DEFAULT false
    watched_at      timestamptz nullable
```

**RLS Policies** (все таблицы):
- SELECT: `auth.uid() = user_id` (через JOIN для seasons/episodes)
- INSERT/UPDATE/DELETE: `auth.uid() = user_id`

---

## Design System

**Концепция**: "Naruto grown-up" — dark cinematic seinen.

**Палитра** (tweakcn tokens):
- Background: `#0D1117`
- Card/Surface: `#1E2A3A`
- Border: `#2D3F55`
- Accent: `#E67E22` (янтарь)
- Accent hover: `#F39C12` (золото)

**Aceternity UI** (точечно):
- LibraryPage hero: Spotlight/Beam
- MediaCard: CardSpotlight hover
- MediaDetailPage: Glow вокруг постера

---

## Units of Work

| Unit | Компоненты | Таблицы |
|---|---|---|
| 1. Foundation | RootLayout, AuthLayout, AppLayout, Navbar, LoginPage, RegisterPage, middleware | — (только Supabase Auth) |
| 2. Media Library | LibraryPage, MediaGrid, MediaCard, FilterBar, SearchPage, SearchInput, TmdbResultCard | media_items |
| 3. Title Detail + Progress | MediaDetailPage, MediaPoster, StatusSelect, RatingInput, NotesEditor, SeasonAccordion, EpisodeRow | seasons, episodes |
| 4. Statistics | StatsPage, StatsOverview, StatsBreakdown, GenreTopList, StatsService | read-only (joins) |