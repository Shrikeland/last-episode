# Infrastructure Design — Unit 3: Title Detail + Progress

## Supabase Queries

### getSeasonsWithEpisodes(client, mediaItemId)
```sql
-- Step 1: load seasons
SELECT * FROM seasons
WHERE media_item_id = $mediaItemId
ORDER BY season_number ASC

-- Step 2: for each season.id load episodes
SELECT * FROM episodes
WHERE season_id = $seasonId
ORDER BY episode_number ASC
```
Реализация: два последовательных Supabase JS запроса (нет вложенных join в supabase-js v2).

### updateMediaItem(client, id, userId, patch)
```sql
UPDATE media_items
SET ...patch, updated_at = NOW()
WHERE id = $id AND user_id = $userId
RETURNING *
```
Используется для обновления `status`, `rating`, `notes`.

### toggleEpisodeWatched(client, episodeId, isWatched)
```sql
UPDATE episodes
SET is_watched = $isWatched,
    watched_at = CASE WHEN $isWatched THEN NOW() ELSE NULL END
WHERE id = $episodeId
RETURNING *
```

### markSeasonWatched(client, seasonId, isWatched)
```sql
UPDATE episodes
SET is_watched = $isWatched,
    watched_at = CASE WHEN $isWatched THEN NOW() ELSE NULL END
WHERE season_id = $seasonId
```

### markAllEpisodesWatched(client, mediaItemId)
```sql
-- Sub-select через supabase-js: сначала достаём season ids, потом batch update
SELECT id FROM seasons WHERE media_item_id = $mediaItemId

UPDATE episodes
SET is_watched = true, watched_at = NOW()
WHERE season_id IN ($seasonIds)
```
Реализация в supabase-js: два запроса (select season ids → update episodes with `.in()`).

## Server Actions

### `app/actions/progress.ts`
```
'use server'
- toggleEpisode(episodeId: string, isWatched: boolean): Promise<void>
- markSeason(seasonId: string, isWatched: boolean): Promise<void>
- updateStatus(mediaItemId: string, status: MediaStatus): Promise<void>
    → если status === 'completed' И type !== 'movie': markAllEpisodesWatched()
- updateRating(mediaItemId: string, rating: number | null): Promise<void>
- updateNotes(mediaItemId: string, notes: string | null): Promise<void>
```
Все actions: `createServerClient()` + `auth.getUser()` перед операцией.

## Database Migration

### Миграция: `rating INTEGER → NUMERIC(3,1)`
Новый файл: `supabase/migrations/20260317100000_rating_half_stars.sql`

```sql
ALTER TABLE media_items
  ALTER COLUMN rating TYPE NUMERIC(3,1);

ALTER TABLE media_items
  DROP CONSTRAINT IF EXISTS media_items_rating_check;

ALTER TABLE media_items
  ADD CONSTRAINT media_items_rating_check
    CHECK (rating >= 1.0 AND rating <= 10.0);
```

**Причина**: поддержка полузвёзд (1.0, 1.5, 2.0 … 10.0) — решение из Functional Design Q1:B.

## Переменные окружения

Без изменений — Unit 3 использует те же переменные что и Units 1–2:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TMDB_API_KEY=         # не нужен в Unit 3 — нет TMDB запросов
```

## TypeScript types (`types/index.ts`)

Добавить `SeasonWithEpisodes`:
```typescript
export interface SeasonWithEpisodes extends Season {
  episodes: Episode[]
}
```
`MediaItem.rating` остаётся `number | null` — совместимо с `NUMERIC(3,1)` из Supabase JS.