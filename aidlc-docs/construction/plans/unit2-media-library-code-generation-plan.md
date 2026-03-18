# Unit 2: Media Library — Code Generation Plan

## Steps

- [x] Step 1: Create `lib/tmdb/tmdb.service.ts`
  - search(query): GET /search/multi, нормализация типа (movie/tv/anime)
  - getMovieDetails(tmdbId): GET /movie/{id}
  - getTVDetails(tmdbId): GET /tv/{id} с сезонами
  - normalizeType(mediaType, genreIds, originCountries): anime detection
  - buildPosterUrl(posterPath): строит URL или возвращает null

- [x] Step 2: Create `lib/supabase/media.ts`
  - getMediaItems(client, userId, filters?, sort?): chained Supabase query с фильтрами
  - getMediaItemById(client, id, userId): single item
  - createMediaItem(client, userId, details): INSERT, обработка 23505 unique violation
  - deleteMediaItem(client, id, userId): DELETE, проверка userId

- [x] Step 3: Create `lib/supabase/progress.ts`
  - createSeasonsAndEpisodes(client, mediaItemId, seasons): batch INSERT seasons + episodes

- [x] Step 4: Create `app/actions/tmdb.ts`
  - searchTmdb(query): Server Action → TmdbService.search()
  - addMediaItem(tmdbId, type): Server Action → getDetails + createMediaItem + createSeasonsAndEpisodes

- [x] Step 5: Create `app/actions/media.ts`
  - deleteMediaItem(id): Server Action → MediaService.deleteMediaItem()

- [x] Step 6: Create `app/(app)/library/page.tsx`
  - Server Component, читает searchParams
  - Вызывает getMediaItems с фильтрами
  - Рендерит FilterBar + MediaGrid

- [x] Step 7: Create `app/(app)/search/page.tsx`
  - Server Component (shell)
  - Рендерит SearchInput

- [x] Step 8: Create `components/library/MediaCard.tsx`
  - Постер с fallback
  - Бейджи type + status
  - Прогресс для tv/anime
  - AlertDialog для удаления

- [x] Step 9: Create `components/library/MediaGrid.tsx`
  - Responsive grid
  - EmptyState если пусто

- [x] Step 10: Create `components/library/FilterBar.tsx`
  - URL sync через router.replace()
  - Debounce 300мс для поиска

- [x] Step 11: Create `components/library/EmptyState.tsx`
  - Два варианта: с фильтрами / без фильтров

- [x] Step 12: Create `components/search/SearchInput.tsx`
  - Controlled input с debounce
  - Вызывает searchTmdb Server Action
  - Рендерит список TmdbResultCard

- [x] Step 13: Create `components/search/TmdbResultCard.tsx`
  - Постер + метаданные + кнопка "Добавить"
  - Вызывает addMediaItem Server Action
  - Toast success/error

- [x] Step 14: Update `aidlc-docs/aidlc-state.md`
  - Отметить Unit 2 как завершённый

- [x] Step 15: Update `aidlc-docs/audit.md`
  - Залогировать завершение Unit 2 Code Generation