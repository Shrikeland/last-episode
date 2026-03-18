# Domain Entities — Unit 3: Title Detail + Progress

## Расширения существующих сущностей

### MediaItem (расширение из Unit 1)
Unit 3 использует `rating` как `number | null` с поддержкой полузначений (0.5 шаг).

> **Миграция**: поле `rating INTEGER` → `NUMERIC(3,1)` для поддержки полузвёзд (1.0, 1.5 … 10.0).
> Ограничение: `CHECK (rating >= 1.0 AND rating <= 10.0)`.

### SeasonWithEpisodes (новая view-сущность, только TypeScript)
Агрегат для отображения на странице тайтла. Не хранится в БД — собирается из `seasons` + `episodes`.

```typescript
interface SeasonWithEpisodes extends Season {
  episodes: Episode[]
  watchedCount: number   // кол-во просмотренных эпизодов (computed)
  totalCount: number     // = episode_count
  isFullyWatched: boolean // watchedCount === totalCount
}
```

### ProgressSummary (вычисляемая сущность, только TypeScript)
Прогресс по тайтлу для отображения на детальной странице.

```typescript
interface ProgressSummary {
  type: 'movie' | 'tv' | 'anime'
  totalEpisodes: number        // суммарно по всем сезонам
  watchedEpisodes: number      // суммарно по всем сезонам
  lastWatchedLabel: string     // "S2E05" или "" если ничего
}
```

## Новые TypeScript-типы (добавить в `types/index.ts`)

```typescript
interface SeasonWithEpisodes extends Season {
  episodes: Episode[]
}

// rating теперь float: 1.0, 1.5, 2.0 ... 10.0
// тип MediaItem.rating остаётся number | null — изменение только на уровне БД и UI
```

## Связи между сущностями

```
MediaItem (1)
  └── Season (N)  [media_item_id → media_items.id]
        └── Episode (N)  [season_id → seasons.id]
```

## Существующие сущности, используемые без изменений

- `MediaStatus` — все 5 статусов
- `MediaType` — movie / tv / anime
- `Season` — без изменений
- `Episode` — без изменений (включает `watched_at: string | null`)