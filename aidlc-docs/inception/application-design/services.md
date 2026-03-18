# Services

## Service Architecture

Два слоя доступа к данным:
1. **Server Actions** (`/app/actions/`) — вызываются из Client Components, выполняются на сервере. Используются для мутаций и запросов, требующих защиты API-ключей.
2. **Supabase Server Client** — используется в Server Components для прямого чтения данных.

---

## TmdbService (`/lib/tmdb/`)

**Назначение**: Обёртка над TMDB API. Выполняется только на сервере (API key не expose клиенту).

**Ответственности**:
- Поиск фильмов, сериалов, аниме по названию
- Получение детальной информации о тайтле (метаданные, жанры, runtime)
- Получение списка сезонов и эпизодов сериала (включая runtime каждого эпизода)
- Нормализация типа: определение `anime` (TMDB genre_id=16 + origin_country=JP)

**Взаимодействие**: Вызывается из Server Actions → `/app/actions/tmdb.ts`

---

## MediaService (`/lib/supabase/media.ts`)

**Назначение**: CRUD операции над таблицей `media_items` в Supabase.

**Ответственности**:
- Добавление нового тайтла в коллекцию (из TMDB данных)
- Получение коллекции пользователя с фильтрацией и сортировкой
- Получение одного тайтла по id
- Обновление статуса, оценки, заметок
- Удаление тайтла (cascade удаляет сезоны/эпизоды через FK)

**Взаимодействие**: Используется в Server Components и Server Actions. Всегда получает `supabaseClient` как параметр (для поддержки SSR и RSC контекстов).

---

## ProgressService (`/lib/supabase/progress.ts`)

**Назначение**: Управление сезонами, эпизодами и прогрессом просмотра.

**Ответственности**:
- Создание записей seasons и episodes при добавлении сериала (данные из TMDB)
- Отметка эпизода как просмотренного / непросмотренного
- Batch-отметка всего сезона (все эпизоды сезона = watched)
- Получение прогресса тайтла (watched count / total count, по сезонам)

**Взаимодействие**: Используется из Server Actions для мутаций, из Server Components для чтения.

---

## StatsService (`/lib/stats.ts`)

**Назначение**: Вычисление статистики на основе данных из Supabase. Чистые функции (не работает с БД напрямую).

**Ответственности**:
- Подсчёт общего времени просмотра (сумма runtime просмотренных эпизодов + завершённых фильмов)
- Форматирование времени: минуты → "X дней Y часов Z минут"
- Разбивка по типу контента (movie/tv/anime)
- Разбивка по статусу (watching/completed/planned/dropped/on_hold)
- Топ-5 жанров по количеству тайтлов

**Взаимодействие**: Вызывается из StatsPage (Server Component). Принимает массивы `MediaItem[]` и `Episode[]`.

---

## Server Actions (`/app/actions/`)

### `tmdb.ts`
- `searchTmdb(query: string, page?: number)` — поиск в TMDB
- `getTmdbDetails(tmdbId: number, type: MediaType)` — детали тайтла
- `getTmdbSeasons(tmdbId: number)` — список сезонов с эпизодами

### `media.ts`
- `addMediaItem(tmdbId: number, type: MediaType)` — добавить тайтл в коллекцию
- `updateMediaStatus(id: string, status: MediaStatus)` — сменить статус
- `updateRatingAndNotes(id: string, rating?: number, notes?: string)` — обновить оценку/заметки
- `deleteMediaItem(id: string)` — удалить из коллекции

### `progress.ts`
- `toggleEpisodeWatched(episodeId: string, watched: boolean)` — отметить/снять эпизод
- `markSeasonWatched(seasonId: string, watched: boolean)` — отметить/снять весь сезон

---

## Supabase Client Factory (`/lib/supabase/`)

- `createServerClient()` — для Server Components и Server Actions (cookies)
- `createBrowserClient()` — для Client Components (singleton)
- Оба используют `@supabase/ssr`