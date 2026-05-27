# Media Area — Exploration

## Цель области

Страница деталей тайтла: просмотр метаданных, смена статуса/рейтинга, заметки, трекинг эпизодов (сезоны + эпизоды) для tv/anime.

## Карта компонентов

| Файл | Тип | Роль |
|------|-----|------|
| `app/(app)/media/[id]/page.tsx` | Server Component | Загружает MediaItem, seasons, episodes; рендерит все дочерние компоненты |
| `components/media/StatusSelect.tsx` | Client Component | Dropdown смены статуса |
| `components/media/RatingInput.tsx` | Client Component | Рейтинг звёздочками (0.5–10) |
| `components/media/NotesEditor.tsx` | Client Component | Редактируемые заметки |
| `components/media/SeasonAccordion.tsx` | Client Component | Список сезонов + кнопка «отметить весь сезон», «отметить всё» |
| `components/media/EpisodeRow.tsx` | Client Component | Строка эпизода с checkbox |

## Server Actions

| Action | Файл |
|--------|------|
| `toggleEpisode(id, isWatched)` | `app/actions/progress.ts` |
| `markSeason(id, isWatched)` | `app/actions/progress.ts` |
| `markAllTitle(id, isWatched)` | `app/actions/progress.ts` |
| `updateStatus(id, status, type)` | `app/actions/progress.ts` |

## Locators (existing testIds)

| Элемент | Локатор | Тир |
|---------|---------|-----|
| Status select | `data-testid="status-select"` | 4 |
| Rating | `data-testid="rating-input"` | 4 |
| Notes editor | `data-testid="notes-editor"` | 4 |
| Season accordion | `data-testid="season-accordion"` | 4 |
| Mark-all button | `data-testid="mark-all-title-button"` | 4 |
| Mark season | `data-testid="mark-season-button-{id}"` | 4 |
| Episode checkbox | `data-testid="episode-checkbox-{id}"` | 4 |
| Title watched indicator | `data-testid="title-watched-indicator"` | 4 |

## User scenarios

1. View media detail page (title, status, rating visible)
2. Change status → persists on reload
3. Toggle single episode watched → progress updates
4. Mark entire season watched
5. Mark all episodes watched
6. Edit notes
