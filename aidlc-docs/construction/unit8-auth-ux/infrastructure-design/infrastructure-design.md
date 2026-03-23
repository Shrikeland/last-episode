# Infrastructure Design — Unit 8: Auth UX Improvement

## Новые файлы

### app/auth/callback/route.ts
- Route Handler (Next.js App Router)
- Не в group `(auth)` — отдельный путь `/auth/callback`
- Использует server Supabase client (`@/lib/supabase/server`)
- `export const dynamic = 'force-dynamic'`

### app/(auth)/email-confirmed/page.tsx
- Server Component
- В group `(auth)` — использует auth layout (центрированная карточка)
- `export const dynamic = 'force-dynamic'`

## Изменённые файлы

### app/(auth)/register/page.tsx
- Только клиентские изменения — новые состояния, убрать toast, добавить inline error

## Supabase конфигурация
- В Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
  нужно добавить: `http://localhost:3000/auth/callback` (dev) и production URL
- Email template использует `{{ .ConfirmationURL }}` который уже ведёт на configured redirect URL

## Без миграций БД
Этот юнит не требует изменений схемы БД.