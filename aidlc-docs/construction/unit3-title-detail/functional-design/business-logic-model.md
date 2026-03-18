# Business Logic Model — Unit 3: Title Detail + Progress

## 1. Загрузка страницы тайтла

**Вход**: `id` (UUID из URL параметра)
**Метод**: Server Component — данные загружаются на сервере

```
MediaDetailPage(id):
  1. createServerClient() → supabase
  2. supabase.auth.getUser() → user (если нет — redirect /login)
  3. getMediaItemById(supabase, id, user.id)
     → если null — notFound()
  4. если item.type !== 'movie':
       getSeasonsWithEpisodes(supabase, id) → SeasonWithEpisodes[]
     иначе:
       seasons = []
  5. render MediaDetailPage(item, seasons)
```

## 2. Функции ProgressService (`lib/supabase/progress.ts`)

### getSeasonsWithEpisodes(client, mediaItemId)
```
1. SELECT * FROM seasons WHERE media_item_id = ? ORDER BY season_number
2. для каждого season:
     SELECT * FROM episodes WHERE season_id = ? ORDER BY episode_number
3. Сборка SeasonWithEpisodes[] (episodes вложены в season)
4. Возврат массива
```

### toggleEpisodeWatched(client, episodeId, isWatched)
```
1. UPDATE episodes
   SET is_watched = isWatched,
       watched_at = isWatched ? NOW() : NULL
   WHERE id = episodeId
2. Возврат обновлённого Episode
```

### markSeasonWatched(client, seasonId, isWatched)
```
1. UPDATE episodes
   SET is_watched = isWatched,
       watched_at = isWatched ? NOW() : NULL
   WHERE season_id = seasonId
2. Возврат void
```

### markAllEpisodesWatched(client, mediaItemId, isWatched)
```
1. Получить все season.id WHERE media_item_id = mediaItemId
2. UPDATE episodes
   SET is_watched = true, watched_at = NOW()
   WHERE season_id IN (season_ids)
3. Возврат void
```

## 3. Функции MediaService (расширение `lib/supabase/media.ts`)

### updateMediaItem(client, id, userId, patch)
```
1. UPDATE media_items
   SET ...patch, updated_at = NOW()
   WHERE id = id AND user_id = userId
2. Возврат обновлённого MediaItem
```
Используется для: смены статуса, обновления рейтинга, обновления заметок.

## 4. Server Actions (`app/actions/progress.ts`)

### toggleEpisode(episodeId, isWatched)
```
1. createServerClient() → supabase
2. auth.getUser() → user
3. progressService.toggleEpisodeWatched(supabase, episodeId, isWatched)
4. revalidatePath('/media/[id]') — опционально, для SSR sync
```

### markSeason(seasonId, isWatched)
```
1. createServerClient() → supabase
2. auth.getUser() → user
3. progressService.markSeasonWatched(supabase, seasonId, isWatched)
```

### updateStatus(mediaItemId, status)
```
1. createServerClient() → supabase
2. auth.getUser() → user
3. mediaService.updateMediaItem(supabase, mediaItemId, user.id, { status })
4. если status === 'completed' AND type !== 'movie':
     progressService.markAllEpisodesWatched(supabase, mediaItemId, true)
```

### updateRating(mediaItemId, rating)  — `rating: number | null`
```
1. createServerClient() → supabase
2. auth.getUser() → user
3. mediaService.updateMediaItem(supabase, mediaItemId, user.id, { rating })
```

### updateNotes(mediaItemId, notes)  — `notes: string | null`
```
1. createServerClient() → supabase
2. auth.getUser() → user
3. mediaService.updateMediaItem(supabase, mediaItemId, user.id, { notes })
```

## 5. Оптимистичные обновления (EpisodeRow / SeasonAccordion)

Паттерн: `useOptimistic` + retry-on-error

```
Схема на примере toggleEpisode:
  1. UI: установить optimisticState (is_watched: !current)
  2. try: await toggleEpisode(episodeId, !current)
         catch: retry 1 раз
                if retry fails:
                  rollback optimisticState
                  toast.error("Ошибка сохранения")
```

## 6. Debounce Autosave для NotesEditor

```
NotesEditor:
  - localValue: string (controlled input)
  - При onChange: обновить localValue + запустить debounce timer (1500мс)
  - При срабатывании debounce: await updateNotes(mediaItemId, localValue)
  - При unmount: flush pending debounce немедленно
```

## 7. Вычисление прогресса (только UI, без БД)

```
computeProgress(seasons: SeasonWithEpisodes[]):
  totalEpisodes = sum(season.episode_count для каждого season)
  watchedEpisodes = sum(episodes.filter(e => e.is_watched).length для каждого season)

  lastWatched = найти последний просмотренный эпизод по watched_at DESC
  lastWatchedLabel = lastWatched ? `S${season_number}E${episode_number}` : ''

  return ProgressSummary { totalEpisodes, watchedEpisodes, lastWatchedLabel }
```