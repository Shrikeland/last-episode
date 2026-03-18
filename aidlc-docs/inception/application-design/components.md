# Components

## Architecture Overview

Next.js 14 App Router. Разделение на Server Components (данные, SEO) и Client Components (интерактивность).
Supabase SSR (@supabase/ssr) для корректной работы auth на сервере и клиенте.

---

## Pages (Next.js App Router Routes)

### `/login` — LoginPage
- **Type**: Client Component
- **Responsibility**: Форма входа email+password через Supabase Auth
- **Inputs**: email, password
- **Outputs**: редирект на /library при успехе

### `/register` — RegisterPage
- **Type**: Client Component
- **Responsibility**: Форма регистрации через Supabase Auth
- **Inputs**: email, password, confirm password
- **Outputs**: редирект на /library при успехе

### `/library` — LibraryPage
- **Type**: Server Component (данные из Supabase) + Client islands
- **Responsibility**: Главная страница — сетка карточек всей коллекции пользователя
- **Contains**: MediaGrid, FilterBar
- **Data**: media_items из Supabase (с фильтрами из URL search params)

### `/search` — SearchPage
- **Type**: Client Component
- **Responsibility**: Поиск тайтлов в TMDB и добавление в коллекцию
- **Contains**: SearchInput, TmdbResultList, TmdbResultCard
- **Data**: запросы к TMDB через Server Action

### `/media/[id]` — MediaDetailPage
- **Type**: Server Component + Client islands
- **Responsibility**: Детальная страница тайтла: постер, описание, статус, оценка, заметки, прогресс по сезонам
- **Contains**: MediaPoster, StatusSelect, RatingInput, NotesEditor, SeasonAccordion

### `/stats` — StatsPage
- **Type**: Server Component
- **Responsibility**: Страница статистики — общее время, разбивка по типу/статусу, топ жанры
- **Contains**: StatsOverview, StatsBreakdown, GenreTopList

---

## Layout Components

### RootLayout
- **Type**: Server Component
- **Responsibility**: HTML shell, шрифты (Geist), Supabase провайдер, Tailwind base styles, tweakcn тема

### AuthLayout
- **Responsibility**: Центрированный card-layout для /login и /register, без навигации

### AppLayout
- **Responsibility**: Layout для защищённых страниц — Navbar + контентная область
- **Contains**: Navbar

### Navbar
- **Type**: Client Component (активный роут, user menu)
- **Responsibility**: Верхняя навигация — лого, ссылки (Library, Search, Stats), кнопка выхода

### middleware.ts
- **Responsibility**: Next.js Middleware — проверяет Supabase сессию, редиректит неавторизованных на /login

---

## UI Components — Library

### MediaCard
- **Type**: Client Component
- **Responsibility**: Карточка тайтла в сетке — постер, название, тип, статус badge, прогресс (для сериалов)
- **Props**: `MediaItem` + обработчик клика
- **Aceternity**: CardSpotlight hover-эффект

### MediaGrid
- **Type**: Client Component
- **Responsibility**: Responsive сетка MediaCard (2–5 колонок в зависимости от ширины)
- **Props**: `MediaItem[]`

### FilterBar
- **Type**: Client Component
- **Responsibility**: Поиск по названию внутри коллекции + фильтры (статус, тип, жанр) + сортировка
- **State**: синхронизируется с URL search params

### EmptyState
- **Type**: Client Component
- **Responsibility**: Пустое состояние коллекции или пустые результаты фильтрации

---

## UI Components — Search

### SearchInput
- **Type**: Client Component
- **Responsibility**: Поле поиска с debounce (300 мс), вызывает Server Action для запроса к TMDB

### TmdbResultCard
- **Type**: Client Component
- **Responsibility**: Карточка результата из TMDB — постер, название, год, тип. Кнопка "Добавить"
- **Props**: `TmdbSearchResult`, callback `onAdd`

---

## UI Components — Media Detail

### MediaPoster
- **Type**: Server Component
- **Responsibility**: Постер тайтла с Aceternity Glow эффектом + базовые метаданные (год, жанры)

### StatusSelect
- **Type**: Client Component
- **Responsibility**: Выпадающий список смены статуса (watching/completed/planned/dropped/on_hold)
- **State**: оптимистичное обновление

### RatingInput
- **Type**: Client Component
- **Responsibility**: Визуальный выбор оценки 1–10 (звёзды или числа)
- **State**: оптимистичное обновление

### NotesEditor
- **Type**: Client Component
- **Responsibility**: Textarea для заметок с автосохранением (debounce)

### SeasonAccordion
- **Type**: Client Component
- **Responsibility**: Раскрывающийся список сезонов. Каждый сезон содержит EpisodeList
- **Props**: `Season[]` с `Episode[]`
- **Actions**: "Отметить весь сезон"

### EpisodeRow
- **Type**: Client Component
- **Responsibility**: Строка эпизода — номер, название, runtime, чекбокс is_watched
- **State**: оптимистичное обновление через Server Action

---

## UI Components — Stats

### StatsOverview
- **Type**: Server Component
- **Responsibility**: Карточка с общим временем просмотра (дни/часы/минуты) и счётчиком тайтлов

### StatsBreakdown
- **Type**: Server Component
- **Responsibility**: Таблица/карточки разбивки по типу (фильм/сериал/аниме) и по статусу

### GenreTopList
- **Type**: Server Component
- **Responsibility**: Топ-5 жанров по количеству тайтлов