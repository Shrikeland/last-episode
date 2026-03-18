# Deployment Architecture — Unit 3: Title Detail + Progress

## Без изменений относительно Unit 1

Unit 3 — логический модуль внутри одного Next.js монолита. Деплой-архитектура не меняется.

| Слой | Сервис |
|---|---|
| Frontend + SSR | Vercel (тот же проект) |
| База данных | Supabase Cloud (тот же проект) |
| Auth | Supabase Auth (без изменений) |
| Внешние API | TMDB — **не используется** в Unit 3 |

## Новые маршруты Next.js

| Маршрут | Тип | Описание |
|---|---|---|
| `/media/[id]` | Dynamic Server Component | Страница тайтла |

Защищён middleware (уже настроен в Unit 1).

## Новые файлы в деплое

```
app/(app)/media/[id]/page.tsx     — новая страница
app/actions/progress.ts           — новые Server Actions
components/media/                 — 7 новых компонентов
lib/supabase/progress.ts          — расширение существующего файла
supabase/migrations/20260317100000_rating_half_stars.sql  — ALTER TABLE
```

## Применение миграции

```bash
# Локально
npx supabase db push

# В продакшне — через Supabase Dashboard → SQL Editor
# или: npx supabase db push --linked
```