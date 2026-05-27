# Search Area — Exploration

## Цель области

TMDB-поиск — основной способ добавления тайтлов в библиотеку. Пользователь вводит запрос, получает результаты от TMDB, выбирает тайтл и добавляет в коллекцию через диалог.

## Карта компонентов и server actions

| Файл | Тип | Роль |
|------|-----|------|
| `app/(app)/search/page.tsx` | Server Component | Оболочка страницы, рендерит `<SearchInput />` |
| `components/search/SearchInput.tsx` | Client Component | Поле ввода с debounce (400ms), вызывает `searchTmdb` |
| `components/search/TmdbResultCard.tsx` | Client Component | Карточка результата, кнопка «Добавить», открывает `AddToLibraryDialog` |
| `components/library/AddToLibraryDialog.tsx` | Client Component | Диалог выбора статуса и оценки перед добавлением |
| `app/actions/tmdb.ts` → `searchTmdb` | Server Action | TMDB search через `TmdbService.search` |
| `app/actions/tmdb.ts` → `getLibraryTmdbIds` | Server Action | Проверяет, какие из найденных тайтлов уже в библиотеке |
| `app/actions/tmdb.ts` → `addMediaItem` | Server Action | Сохраняет тайтл в `media_items`, создаёт сезоны/эпизоды |

## Пользовательские сценарии

### Happy path
1. Перейти на `/search` (нужна авторизация)
2. Ввести запрос (≥1 символ), через 400ms — spinner, затем результаты
3. Нажать «Добавить» на карточке → открывается диалог
4. Выбрать статус, опционально оценку → «Сохранить»
5. Кнопка меняется на «Добавлено» (Check icon), toast «добавлен в коллекцию»

### Edge cases
- Поиск без результатов: текст «Ничего не найдено по запросу...»
- Тайтл уже в библиотеке: кнопка «Добавлено» сразу (disabled)
- Очистка поиска: кнопка X сбрасывает запрос и результаты
- Отмена диалога: тайтл не добавляется

## Existing locators

| Элемент | Локатор | Тир |
|---------|---------|-----|
| Поисковый ввод | `data-testid="search-input"` | 4 |
| Кнопка очистки | `aria-label="Очистить поиск"` | 1 |
| Карточка результата | `data-testid="tmdb-result-card-{id}"` | 4 |
| Кнопка «Добавить» | `getByRole('button', { name: 'Добавить' })` внутри карточки | 1 |
| Диалог | `getByRole('dialog')` | 1 |
| Статус (select) | `aria-label="Статус тайтла"` | 1 |
| Confirm | `getByRole('button', { name: 'Сохранить' })` | 1 |
| Cancel | `getByRole('button', { name: 'Отмена' })` | 1 |

## Внешние зависимости

- **TMDB API**: реальный поиск при интеграционных тестах. Стабилен, но зависит от сети.
- **Supabase**: сохранение тайтла — нужна авторизация (storageState из auth-области).

## Риски

- Тайтлы, добавленные в тестах, засоряют библиотеку. Нужно либо cleanup, либо использовать уже-добавленный тайтл и проверять состояние «Добавлено».
- TMDB возвращает разные результаты при изменении контента — тесты должны искать стабильные тайтлы (типа "Breaking Bad").
