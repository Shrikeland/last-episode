# Infrastructure Design — Unit 2: Media Library

## Supabase Queries

### getMediaItems — фильтрация и сортировка
```sql
SELECT * FROM media_items
WHERE user_id = auth.uid()
  [AND status = $status]          -- если не 'all'
  [AND type = $type]              -- если не 'all'
  [AND genres @> '["$genre"]']    -- jsonb contains, если genre задан
  [AND (title ILIKE '%$search%' OR original_title ILIKE '%$search%')]
ORDER BY $sortField $sortDirection
```

Реализация через Supabase JS chained `.eq()`, `.ilike()`, `.contains()`, `.order()`.

### createMediaItem — INSERT
```sql
INSERT INTO media_items (user_id, tmdb_id, type, title, original_title,
  overview, poster_url, release_year, genres, status, runtime_minutes)
VALUES (auth.uid(), $tmdbId, $type, $title, ...)
RETURNING *
```

При `UNIQUE (user_id, tmdb_id)` violation → catch PostgrestError с code `'23505'` → вернуть `{ error: 'already_exists' }`.

### deleteMediaItem — DELETE CASCADE
```sql
DELETE FROM media_items WHERE id = $id AND user_id = auth.uid()
```
CASCADE автоматически удаляет связанные `seasons` и `episodes`.

## TMDB API

### Базовый URL
`https://api.themoviedb.org/3`

### Используемые эндпоинты
| Метод | URL | Использование |
|-------|-----|---------------|
| GET | `/search/multi` | Поиск фильмов и сериалов |
| GET | `/movie/{id}` | Детали фильма |
| GET | `/tv/{id}` | Детали сериала + сезоны |
| GET | `/tv/{id}/season/{n}` | Эпизоды сезона |

### Параметры запросов
- `api_key`: из `process.env.TMDB_API_KEY`
- `language=ru-RU` для всех запросов
- `append_to_response=credits` для деталей (будущее)

### Постер URL
`https://image.tmdb.org/t/p/w500{poster_path}` или `null`

## Server Actions

### `app/actions/tmdb.ts`
```
'use server'
- searchTmdb(query): вызывает TmdbService.search()
- addMediaItem(tmdbId, type): вызывает TmdbService.getDetails() + MediaService.create()
  - createServerClient() для Supabase
  - getUser() для userId
  - Если type='tv'|'anime': создаём seasons+episodes через ProgressService
```

### `app/actions/media.ts`
```
'use server'
- deleteMediaItem(id): createServerClient() → MediaService.deleteMediaItem()
- Возвращает { error?: string }
```

## Переменные окружения

```
TMDB_API_KEY=         # Без NEXT_PUBLIC_ — только сервер
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Новые таблицы / миграции

**Не требуются** — все таблицы (`media_items`, `seasons`, `episodes`) созданы в Unit 1.