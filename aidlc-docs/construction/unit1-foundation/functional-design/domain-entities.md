# Domain Entities — Unit 1: Foundation

## User (Supabase Auth)
Управляется Supabase Auth — не создаём вручную.

| Поле | Тип | Описание |
|---|---|---|
| id | uuid | Primary key (auth.uid()) |
| email | text | Уникальный email |
| created_at | timestamptz | Дата регистрации |

## Session
Управляется Supabase (@supabase/ssr). Хранится в cookies.

| Поле | Тип | Описание |
|---|---|---|
| access_token | JWT | Токен доступа |
| refresh_token | string | Токен обновления |
| expires_at | number | Unix timestamp истечения |
| user | User | Вложенный объект пользователя |

## Shared TypeScript Types (все unit'ы)

```typescript
// /types/index.ts

type MediaType = 'movie' | 'tv' | 'anime'

type MediaStatus =
  | 'watching'
  | 'completed'
  | 'planned'
  | 'dropped'
  | 'on_hold'

interface MediaItem {
  id: string
  user_id: string
  tmdb_id: number
  type: MediaType
  title: string
  original_title: string
  overview: string
  poster_url: string | null
  release_year: number | null
  genres: string[]
  status: MediaStatus
  rating: number | null
  notes: string | null
  runtime_minutes: number | null
  created_at: string
  updated_at: string
}

interface Season {
  id: string
  media_item_id: string
  tmdb_season_id: number
  season_number: number
  name: string
  episode_count: number
}

interface Episode {
  id: string
  season_id: string
  tmdb_episode_id: number
  episode_number: number
  name: string
  runtime_minutes: number | null
  is_watched: boolean
  watched_at: string | null
}

interface TmdbSearchResult {
  tmdb_id: number
  type: MediaType
  title: string
  original_title: string
  poster_path: string | null
  release_year: number | null
  overview: string
}

interface TmdbDetails extends TmdbSearchResult {
  genres: string[]
  runtime_minutes: number | null
  seasons?: TmdbSeason[]
}

interface TmdbSeason {
  tmdb_season_id: number
  season_number: number
  name: string
  episodes: TmdbEpisode[]
}

interface TmdbEpisode {
  tmdb_episode_id: number
  episode_number: number
  name: string
  runtime_minutes: number | null
}

// Supabase Database types (генерируется CLI, дополняется вручную)
type Database = {
  public: {
    Tables: {
      media_items: { Row: MediaItem; Insert: Omit<MediaItem, 'id' | 'created_at' | 'updated_at'>; Update: Partial<MediaItem> }
      seasons: { Row: Season; Insert: Omit<Season, 'id'>; Update: Partial<Season> }
      episodes: { Row: Episode; Insert: Omit<Episode, 'id'>; Update: Partial<Episode> }
    }
  }
}
```