# Library Area — Exploration

## Цель области

Библиотека — главная страница авторизованного пользователя. Показывает коллекцию медиа, сгруппированную по типу. Позволяет фильтровать, сортировать и удалять элементы.

## Карта компонентов

| Файл | Тип | Роль |
|------|-----|------|
| `app/(app)/library/page.tsx` | Server Component | Загружает items из DB, передаёт в LibrarySections + FilterBar |
| `components/library/LibrarySections.tsx` | Server Component | Группирует по типу (movie/animation/tv/anime), рендерит MediaSection |
| `components/library/MediaSection.tsx` | Server Component | Секция для одного типа |
| `components/library/MediaGrid.tsx` | Server Component | Сетка при активных фильтрах |
| `components/library/MediaCard.tsx` | Client Component | Карточка тайтла: постер, статус, прогресс, удаление |
| `components/library/FilterBarNoSSR.tsx` | Client Component | Обёртка `next/dynamic` для FilterBar |
| `components/library/FilterBar.tsx` | Client Component | Ввод поиска + выбор статуса + сортировка; обновляет URL query params |
| `components/library/EmptyState.tsx` | Server Component | Заглушка пустой библиотеки |

## Server Actions

| Action | Файл | Роль |
|--------|------|------|
| `deleteMediaItem(id)` | `app/actions/media.ts` | Удаляет элемент из `media_items` |
| `getMediaItems(...)` | `lib/supabase/media.ts` | Чтение (через page) |

## Пользовательские сценарии

1. Просмотр библиотеки — карточки видны
2. Фильтр по тексту — карточки фильтруются в реальном времени через URL
3. Фильтр по статусу — только нужный статус
4. Сортировка
5. Удаление карточки — confirm dialog → item исчезает
6. Пустая библиотека — EmptyState
7. Неавторизованный доступ → /login

## Locators

| Элемент | Локатор | Тир |
|---------|---------|-----|
| Карточка медиа | `data-testid="media-card-{id}"` | 4 |
| Кнопка удаления | `aria-label="Удалить"` внутри карточки | 1 |
| Confirm delete | `getByRole('button', { name: 'Удалить' })` (AlertDialog) | 1 |
| Cancel delete | `getByRole('button', { name: 'Отмена' })` | 1 |
| Filter search | `getByPlaceholder('Поиск по названию...')` | 3 |
| Status select | `getByRole('combobox')` первый | 1 |
| Sort select | `getByRole('combobox')` второй | 1 |

## Риски

- FilterBar не имеет data-testid → нужны locators tier 1/3 по placeholder и role
- Карточки требуют `item.id` из БД для точной адресации; для тестов используем first()
