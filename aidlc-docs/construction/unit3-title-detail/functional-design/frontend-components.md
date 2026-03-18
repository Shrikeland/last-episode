# Frontend Components — Unit 3: Title Detail + Progress

## Page Components

### MediaDetailPage (`app/(app)/media/[id]/page.tsx`)
Server Component
- Params: `{ id: string }`
- Загружает `MediaItem` и `SeasonWithEpisodes[]` на сервере
- Рендерит левую колонку (постер) + правую колонку (детали + прогресс)
- Layout: `grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8`

---

## Media Components

### MediaPoster (`components/media/MediaPoster.tsx`)
Client Component (для Aceternity Glow)
- Props: `posterUrl: string | null`, `title: string`, `type: MediaType`
- Aceternity Glow-эффект вокруг постера (мягкое свечение amber)
- Fallback: серый блок с иконкой Film если `posterUrl === null`
- Размер: фиксированный `w-[240px] h-[360px]` (пропорции 2:3)
- `data-testid="media-poster"`

### StatusSelect (`components/media/StatusSelect.tsx`)
Client Component
- Props: `mediaItemId: string`, `currentStatus: MediaStatus`, `mediaType: MediaType`
- Использует shadcn `Select`
- Options: все 5 статусов с русскими метками (`MEDIA_STATUS_LABELS`)
- При изменении: `updateStatus(mediaItemId, newStatus)` Server Action
- Показывает цветной Badge с текущим статусом (цвета из design system)
- `data-testid="status-select"`

### RatingInput (`components/media/RatingInput.tsx`)
Client Component
- Props: `mediaItemId: string`, `currentRating: number | null`
- 10 звёзд с поддержкой полузвёзд (hover на левой/правой половине = 0.5 шаг)
- Реализация: каждая звезда — два `<button>` (левая половина, правая половина)
- Hover-preview: при наведении подсвечиваются звёзды до курсора
- Клик на текущую оценку → `updateRating(mediaItemId, null)` (сброс)
- Клик на другую → `updateRating(mediaItemId, newRating)`
- Отображение: закрашенные / полузакрашенные / пустые звёзды (amber цвет)
- Рядом с звёздами: текст текущей оценки "8.5 / 10" или "-"
- `data-testid="rating-input"`

### NotesEditor (`components/media/NotesEditor.tsx`)
Client Component
- Props: `mediaItemId: string`, `initialNotes: string | null`
- Controlled `<Textarea>` (shadcn)
- Debounce autosave 1500мс через `useCallback` + `useRef` для timer
- Flush на unmount через `useEffect` cleanup
- Пустая строка → сохраняется как `null`
- Нет кнопки сохранения
- `data-testid="notes-editor"`

### SeasonAccordion (`components/media/SeasonAccordion.tsx`)
Client Component
- Props: `seasons: SeasonWithEpisodes[]`, `mediaItemId: string`
- Использует shadcn `Accordion` (type="multiple" — несколько открытых одновременно)
- Каждый `AccordionItem` = один сезон
- Header: `"{season.name}" · {watchedCount}/{totalCount} эпизодов`
  + кнопка "Отметить весь сезон" (toggle)
- Body: список `<EpisodeRow>` для каждого эпизода
- `useOptimistic` управляет состоянием episodes для optimistic updates
- `data-testid="season-accordion"`

### EpisodeRow (`components/media/EpisodeRow.tsx`)
Client Component
- Props: `episode: Episode`, `onToggle: (episodeId: string, isWatched: boolean) => void`
- Layout: `flex items-center gap-3`
- Элементы слева направо:
  1. `Checkbox` (shadcn) — `checked={episode.is_watched}`, `data-testid="episode-checkbox-{id}"`
  2. Номер: `E{episode_number}` — моноширинный шрифт, text-muted
  3. Название эпизода — `text-sm`
  4. Runtime (если есть): `{runtime_minutes} мин` — text-muted text-xs
  5. Дата просмотра (если `is_watched && watched_at`): `{DD.MM.YYYY}` — text-muted text-xs

---

## Структура страницы (MediaDetailPage)

```
<div class="max-w-5xl mx-auto px-4 py-6">
  <!-- Назад -->
  <BackButton />  ← router.back() + fallback href="/library"

  <div class="grid md:grid-cols-[280px_1fr] gap-8">
    <!-- Левая колонка -->
    <div>
      <MediaPoster posterUrl title type />
    </div>

    <!-- Правая колонка -->
    <div class="space-y-6">
      <!-- Заголовок -->
      <div>
        <h1>{item.title}</h1>
        <p class="text-muted">{item.original_title} · {item.release_year}</p>
        <!-- Жанры: badge для каждого -->
        <div class="flex flex-wrap gap-2">{genres.map(Badge)}</div>
      </div>

      <!-- Статус + Рейтинг в одной строке -->
      <div class="flex items-center gap-6">
        <StatusSelect />
        <RatingInput />
      </div>

      <!-- Обзор -->
      <p class="text-sm text-muted-foreground">{item.overview}</p>

      <!-- Заметки -->
      <NotesEditor />

      <!-- Прогресс (только tv/anime) -->
      {type !== 'movie' && seasons.length > 0 && (
        <SeasonAccordion seasons={seasonsWithEpisodes} />
      )}
    </div>
  </div>
</div>
```

---

## BackButton (`components/media/BackButton.tsx`)
Client Component (нужен `router.back()`)
- `<Button variant="ghost">← Назад</Button>` → `router.back()`
- Fallback ссылка `<Link href="/library">Библиотека</Link>` рядом
- `data-testid="back-button"`