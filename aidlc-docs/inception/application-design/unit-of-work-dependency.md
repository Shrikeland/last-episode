# Unit of Work Dependencies

## Dependency Matrix

| Unit | Depends On | Reason |
|---|---|---|
| Unit 1: Foundation | — | Нет зависимостей, первый в очереди |
| Unit 2: Media Library | Unit 1 | Требует: auth, Supabase client, shared types, таблица media_items |
| Unit 3: Title Detail + Progress | Unit 1, Unit 2 | Требует: auth, media_items, Supabase client, MediaService для страницы |
| Unit 4: Statistics | Unit 1, Unit 2, Unit 3 | Требует: все таблицы (media_items + episodes), данные для расчётов |

## Development Sequence

```
Unit 1: Foundation
    |
    v
Unit 2: Media Library
    |
    v
Unit 3: Title Detail + Progress
    |
    v
Unit 4: Statistics
```

Строго последовательно — каждый следующий unit'а зависит от предыдущего.

## Integration Points

| От | К | Что передаётся |
|---|---|---|
| Unit 1 | Unit 2 | `createServerClient()`, `createBrowserClient()`, `MediaItem` type, Supabase schema |
| Unit 1 | Unit 3 | Auth context, Supabase clients |
| Unit 2 | Unit 3 | `MediaItem` data, `MediaService.getMediaItemById()` |
| Unit 2 | Unit 4 | `MediaItem[]` данные, `MediaService.getMediaItems()` |
| Unit 3 | Unit 4 | `Episode[]` с `runtime_minutes` и `is_watched`, `ProgressService.getWatchedEpisodes()` |

## Shared Artifacts (Unit 1 → все)

- `types/index.ts` — все типы используются во всех unit'ах
- `lib/supabase/client.ts` — используется везде
- `supabase/migrations/001_initial_schema.sql` — все таблицы созданы в Unit 1
- Tailwind конфиг + tweakcn тема — применяется глобально