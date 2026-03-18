# Domain Entities — Unit 2: Media Library

Все типы унаследованы из `types/index.ts` (Unit 1).
Unit 2 добавляет только вспомогательные интерфейсы:

```typescript
// Результат добавления из TMDB
interface AddMediaResult {
  success: boolean
  mediaItem?: MediaItem
  error?: 'already_exists' | 'tmdb_error' | 'db_error'
}

// Состояние FilterBar
interface FilterState {
  search: string
  status: MediaStatus | 'all'
  type: MediaType | 'all'
  genre: string    // '' = без фильтра
  sortField: SortField
  sortDirection: SortDirection
}

// Для отображения прогресса на карточке
interface MediaCardProgress {
  currentSeason: number
  watchedInSeason: number
  totalInSeason: number
  isCompleted: boolean
}
```

## Service Methods (Unit 2)

### TmdbService (`lib/tmdb/tmdb.service.ts`)
```typescript
search(query: string): Promise<TmdbSearchResult[]>
getMovieDetails(tmdbId: number): Promise<TmdbDetails>
getTVDetails(tmdbId: number): Promise<TmdbDetails>  // включает seasons[]
normalizeType(mediaType: 'movie'|'tv', genreIds: number[], originCountries: string[]): MediaType
buildPosterUrl(posterPath: string | null): string | null
```

### MediaService (`lib/supabase/media.ts`)
```typescript
getMediaItems(client, userId, filters?, sort?): Promise<MediaItem[]>
getMediaItemById(client, id, userId): Promise<MediaItem | null>
createMediaItem(client, userId, details: TmdbDetails): Promise<MediaItem>
deleteMediaItem(client, id, userId): Promise<void>
```

### Server Actions (`app/actions/tmdb.ts`, `app/actions/media.ts`)
```typescript
// tmdb.ts
searchTmdb(query: string): Promise<TmdbSearchResult[]>
addMediaItem(tmdbId: number, type: MediaType): Promise<AddMediaResult>

// media.ts
deleteMediaItem(id: string): Promise<{ error?: string }>
```