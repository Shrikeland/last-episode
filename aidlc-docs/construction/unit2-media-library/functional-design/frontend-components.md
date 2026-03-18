# Frontend Components — Unit 2: Media Library

## Page Components

### LibraryPage (`app/(app)/library/page.tsx`)
Server Component
- Читает `searchParams` (status, type, genre, sort, search)
- Вызывает `MediaService.getMediaItems()`
- Рендерит `FilterBar` + `MediaGrid`
- Props: `searchParams: Promise<SearchParams>`

### SearchPage (`app/(app)/search/page.tsx`)
Server Component (shell) + Client Component внутри
- Статическая оболочка, основная логика в SearchInput
- Рендерит `SearchInput` + список `TmdbResultCard`

## Library Components

### MediaGrid (`components/library/MediaGrid.tsx`)
Client Component (или Server)
- Props: `items: MediaItem[]`
- Responsive grid: 2 cols mobile, 3 tablet, 4-5 desktop
- Если `items.length === 0` → `<EmptyState>`
- Рендерит `<MediaCard>` для каждого элемента

### MediaCard (`components/library/MediaCard.tsx`)
Client Component
- Props: `item: MediaItem`
- Постер (img с fallback — серый блок + Film icon)
- Бейдж типа (movie/tv/anime)
- Бейдж статуса с цветом из CSS vars
- Прогресс (только для tv/anime): "S2 · 5/13" или "завершено"
- Кнопка удаления → confirmation AlertDialog
- Клик на карточку → `/library/{id}`
- `data-testid="media-card-{id}"`

### FilterBar (`components/library/FilterBar.tsx`)
Client Component
- Props: `currentFilters: FilterState`
- `useRouter` + `useSearchParams` для URL sync
- Inputs: поиск (text), статус (Select), тип (Select), жанр (Select/Input), сортировка
- `updateFilters()` → `router.replace()` с новыми params
- Debounce 300мс только для текстового поиска

### EmptyState (`components/library/EmptyState.tsx`)
Server Component
- Props: `hasFilters: boolean`
- Если `hasFilters=true`: "Ничего не найдено. Сбросить фильтры?"
- Если `hasFilters=false`: "Ваша коллекция пуста. Найти тайтл?"

## Search Components

### SearchInput (`components/search/SearchInput.tsx`)
Client Component
- Controlled input с debounce 300мс
- При вводе вызывает `searchTmdb(query)` Server Action
- Показывает состояния: idle, loading, results[], error
- `data-testid="search-input"`

### TmdbResultCard (`components/search/TmdbResultCard.tsx`)
Client Component
- Props: `result: TmdbSearchResult`, `onAdd: (tmdbId, type) => void`
- Постер (50x75px) + название + год + тип + кнопка "Добавить"
- Loading state на кнопке во время `addMediaItem()`
- Toast success/error через `sonner`
- `data-testid="tmdb-result-card-{tmdbId}"`