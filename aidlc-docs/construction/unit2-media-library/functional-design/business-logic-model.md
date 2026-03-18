# Business Logic Model — Unit 2: Media Library

## TMDB Search Flow
```
1. Пользователь вводит запрос (debounce 300мс)
2. Server Action searchTmdb(query) → TmdbService.search()
3. TMDB API: GET /search/multi?query=...&language=ru-RU
4. Нормализация результатов:
   - media_type=movie → type='movie'
   - media_type=tv:
     - genre_ids включает 16 И origin_country включает 'JP' → type='anime'
     - иначе → type='tv'
5. Вернуть TmdbSearchResult[] (макс. 20 результатов)
```

## Add Media Item Flow
```
1. Пользователь кликает "Добавить" на TmdbResultCard
2. Server Action addMediaItem(tmdbId, type):
   a. Проверить: нет ли уже этого tmdbId у пользователя (UNIQUE constraint)
      → Если есть: вернуть ошибку "Уже в коллекции"
   b. TmdbService.getDetails(tmdbId, type) → получить полные метаданные
   c. MediaService.create(userId, details) → INSERT в media_items
   d. Если type='tv' или 'anime':
      - TmdbService.getSeasons(tmdbId) → список сезонов с эпизодами
      - ProgressService.createSeasonsAndEpisodes(mediaItemId, seasons)
3. Вернуть созданный MediaItem
4. UI: toast.success + обновить список
```

## Library Page Data Flow
```
1. Server Component LibraryPage получает searchParams из URL
2. Парсинг filters из URL: ?status=watching&type=anime&genre=Action&sort=title
3. MediaService.getMediaItems(userId, filters, sort) → MediaItem[]
4. Отрисовка MediaGrid с карточками
5. FilterBar синхронизируется с URL params (client-side)
```

## Filter & Search Flow
```
FilterBar (Client Component):
1. Пользователь меняет фильтр/поиск
2. updateFilters() обновляет URL search params через router.replace()
3. URL изменяется → Next.js перезапрашивает Server Component
4. MediaService применяет фильтры на стороне Supabase (WHERE clause)

Поиск по названию:
- Supabase: ilike '%query%' на поле title + original_title
- Без дебаунса на уровне URL (router.replace уже батчит)
```

## Delete Media Item Flow
```
1. Пользователь кликает "Удалить" на карточке
2. Confirmation dialog (AlertDialog)
3. Server Action deleteMediaItem(id)
4. Supabase DELETE (CASCADE удаляет seasons → episodes)
5. UI: router.refresh() для обновления списка
```
