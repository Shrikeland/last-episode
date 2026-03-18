# Component Methods

Сигнатуры методов и Server Actions. Детальная бизнес-логика — в Functional Design (CONSTRUCTION phase).

---

## Shared Types (`/types/index.ts`)

```typescript
type MediaType = 'movie' | 'tv' | 'anime'

type MediaStatus = 'watching' | 'completed' | 'planned' | 'dropped' | 'on_hold'

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
  rating: number | null        // 1-10
  notes: string | null
  runtime_minutes: number | null  // для фильмов
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

// TMDB API shapes
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
  runtime_minutes: number | null   // фильм
  seasons?: TmdbSeason[]           // сериал/аниме
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
```

---

## TmdbService

```typescript
class TmdbService {
  search(query: string, page?: number): Promise<TmdbSearchResult[]>
  getMovieDetails(tmdbId: number): Promise<TmdbDetails>
  getTVDetails(tmdbId: number): Promise<TmdbDetails>
  getSeasonEpisodes(tmdbId: number, seasonNumber: number): Promise<TmdbEpisode[]>
  // определяет anime по genre_id=16 + origin_country включает JP
  normalizeType(rawType: 'movie' | 'tv', genres: number[], originCountries: string[]): MediaType
}
```

---

## MediaService

```typescript
// все методы принимают supabaseClient для совместимости SSR/RSC
async function getMediaItems(
  client: SupabaseClient,
  userId: string,
  filters?: { status?: MediaStatus; type?: MediaType; genre?: string; minRating?: number; maxRating?: number },
  sort?: { field: 'created_at' | 'title' | 'rating'; direction: 'asc' | 'desc' }
): Promise<MediaItem[]>

async function getMediaItemById(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<MediaItem | null>

async function createMediaItem(
  client: SupabaseClient,
  userId: string,
  details: TmdbDetails
): Promise<MediaItem>

async function updateMediaItem(
  client: SupabaseClient,
  id: string,
  userId: string,
  data: Partial<Pick<MediaItem, 'status' | 'rating' | 'notes'>>
): Promise<MediaItem>

async function deleteMediaItem(
  client: SupabaseClient,
  id: string,
  userId: string
): Promise<void>
```

---

## ProgressService

```typescript
async function createSeasonsAndEpisodes(
  client: SupabaseClient,
  mediaItemId: string,
  seasons: TmdbSeason[]
): Promise<void>

async function getSeasonsWithEpisodes(
  client: SupabaseClient,
  mediaItemId: string
): Promise<(Season & { episodes: Episode[] })[]>

async function toggleEpisodeWatched(
  client: SupabaseClient,
  episodeId: string,
  watched: boolean
): Promise<void>

async function markSeasonWatched(
  client: SupabaseClient,
  seasonId: string,
  watched: boolean
): Promise<void>

async function getWatchedEpisodes(
  client: SupabaseClient,
  userId: string
): Promise<Episode[]>  // для StatsService
```

---

## StatsService

```typescript
interface WatchStats {
  totalMinutes: number
  formattedTime: string  // "X дней Y часов Z минут"
  byType: Record<MediaType, { count: number; minutes: number }>
  byStatus: Record<MediaStatus, number>
  topGenres: { genre: string; count: number }[]
}

function calculateStats(
  mediaItems: MediaItem[],
  watchedEpisodes: Episode[]
): WatchStats

function formatMinutes(minutes: number): string
// 1500 min → "1 день 1 час 0 минут"
```

---

## Key Client Component Methods

### FilterBar
```typescript
// синхронизирует state с URL params
function updateFilters(filters: FilterState): void
// читает начальное состояние из URL
function parseFiltersFromURL(searchParams: URLSearchParams): FilterState
```

### EpisodeRow
```typescript
// оптимистичное обновление: сначала обновляет UI, потом вызывает Server Action
async function handleToggle(episodeId: string, currentWatched: boolean): Promise<void>
```

### NotesEditor
```typescript
// debounce 1000мс перед сохранением
function handleNotesChange(value: string): void
```