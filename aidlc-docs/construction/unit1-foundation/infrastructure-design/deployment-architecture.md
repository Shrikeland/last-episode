# Deployment Architecture — Unit 1: Foundation

## Architecture Overview

```
Developer
    |
    | git push → main
    v
GitHub Repository
    |
    | webhook
    v
Vercel (автодеплой)
    |
    | Next.js build (next build)
    | Server Components → статический HTML
    | Server Actions → serverless functions
    v
Vercel Edge Network (CDN)
    |
    | auth cookies
    v
Supabase Cloud
  ├── PostgreSQL (media_items, seasons, episodes)
  ├── Auth (users, sessions, JWT)
  └── (Storage — не используется в MVP)
```

## Vercel Project Setup

1. Подключить GitHub репозиторий к Vercel
2. Framework Preset: Next.js (автоопределение)
3. Build Command: `next build` (по умолчанию)
4. Output Directory: `.next` (по умолчанию)
5. Добавить Environment Variables в Vercel Dashboard

## Supabase CLI & Migrations

```bash
# Установить Supabase CLI
npm install supabase --save-dev

# Инициализировать в проекте
npx supabase init

# Создать первую миграцию
npx supabase migration new initial_schema
# → создаст supabase/migrations/20260317000000_initial_schema.sql
# Скопировать SQL из infrastructure-design.md в этот файл

# Применить локально (для dev)
npx supabase db push

# Применить на production
npx supabase db push --linked
# (после npx supabase link --project-ref <project-id>)
```

## Next.js Project Initialization

```bash
# Инициализация проекта (выполняется при Code Generation)
cd /Users/hornysennin/Desktop/projects/last-episode
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"

# Установить зависимости
npm install @supabase/supabase-js @supabase/ssr
npm install next-themes
npx shadcn@latest init

# Установить shadcn компоненты (по мере необходимости в unit'ах)
npx shadcn@latest add button input card form label toast badge
npx shadcn@latest add select textarea accordion checkbox dropdown-menu
```

## Local Development Workflow

```bash
# 1. Запустить Supabase локально (опционально, или использовать remote)
npx supabase start

# 2. Запустить Next.js dev server
npm run dev
# → http://localhost:3000

# 3. Применить миграции
npx supabase db push
```

## File: .env.local (не коммитить!)

```
NEXT_PUBLIC_SUPABASE_URL=https://<id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
TMDB_API_KEY=<key>
```

Добавить в `.gitignore`:
```
.env.local
.env*.local
```