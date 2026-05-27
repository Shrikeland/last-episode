# Stats Area — Exploration

## Цель

Read-only страница статистики. Показывает общее время просмотра, разбивку по типам и топ жанров.

## Компоненты

- `app/(app)/stats/page.tsx` — Server Component, вычисляет stats через `computeStats`
- `components/stats/StatsOverview.tsx` — общее время, breakdown по типам
- `components/stats/StatsBreakdown.tsx` — прогресс-бары по типам
- `components/stats/GenreTopList.tsx` — топ жанров

## Locators (нет data-testid, используем text/role)

| Элемент | Локатор | Тир |
|---------|---------|-----|
| Заголовок | `page.locator('h1').filter({ hasText: 'Статистика' })` | 3 |
| Общее время | `page.getByText(/Общее время просмотра/)` | 3 |
| Тайтлов: N | `page.getByText(/Тайтлов/)` | 3 |
