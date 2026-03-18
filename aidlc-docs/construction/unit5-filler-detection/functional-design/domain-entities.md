# Domain Entities — Unit 5: Anime Filler Detection

## Новые сущности БД

### FillerEpisode (глобальная таблица, без user_id)
Кэш филлерных эпизодов — общий для всех пользователей.

```typescript
interface FillerEpisode {
  tmdb_id: number
  season_number: number       // соответствует season_number в нашей БД
  absolute_episode_number: number  // сплошная нумерация по всему тайтлу
}
// PK: (tmdb_id, absolute_episode_number)
```

> **Почему абсолютный номер?** anime-filler-list.com нумерует эпизоды сплошным
> списком (1–220 для Наруто), не разбивая по сезонам. TMDB разбивает на сезоны.
> При сохранении вычисляем абсолютный номер: эпизод S2E3, где S1 имел 26 эп. → ep 29.

### AnimeFillerCache
Статус обработки фильтра по каждому аниме. Исключает повторные запросы.

```typescript
interface AnimeFillerCache {
  tmdb_id: number           // PK
  status: 'fetched' | 'not_found' | 'error'
  source_url: string | null // URL на anime-filler-list.com (для отладки)
  fetched_at: string        // TIMESTAMPTZ
}
```

## Расширение существующих сущностей

### Episode (добавить поле)
```typescript
interface Episode {
  // ... существующие поля ...
  is_filler: boolean  // DEFAULT false — новое поле
}
```

## Вспомогательные TypeScript-типы (только сервер)

```typescript
// Результат парсинга anime-filler-list.com
interface FillerParseResult {
  sourceUrl: string
  fillerEpisodeNumbers: number[]  // абсолютные номера
}

// Результат поиска на AniList
interface AniListMatch {
  malId: number | null
  titleRomaji: string
  titleEnglish: string | null
}
```

## Источники данных

| Источник | Роль | Тип доступа |
|---|---|---|
| anime-filler-list.com | Список филлерных эпизодов | HTML scraping |
| AniList GraphQL API | Получение Romaji/English title для точного матчинга | Бесплатный GraphQL API |
| `filler_episodes` (Supabase) | Глобальный кэш | Service Role (запись), Anon (чтение) |
| `anime_filler_cache` (Supabase) | Статус обработки | Service Role (запись), Anon (чтение) |

## Связи

```
media_items (1)
  └── AnimeFillerCache (1)   [tmdb_id → media_items.tmdb_id]
  └── FillerEpisode (N)      [tmdb_id → media_items.tmdb_id]
        ↓ применяется к
      episodes.is_filler = true
```