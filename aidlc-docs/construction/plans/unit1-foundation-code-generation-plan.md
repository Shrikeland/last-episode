# Unit 1: Foundation — Code Generation Plan

## Unit Context
- **FR покрываются**: FR-01 (Authentication)
- **NFR покрываются**: NFR-02 (dark theme), NFR-03 (RLS), NFR-04 (deploy config), NFR-05 (design system)
- **Зависимости**: нет (первый unit)
- **Workspace root**: /Users/hornysennin/Desktop/projects/last-episode

## Code Location
Все файлы — в workspace root. Существующие `src/index.ts`, `package.json`, `tsconfig.json` заменяются.

---

## Steps

### Step 1: Project Initialization
- [x] Создать `package.json` с Next.js 15 и всеми зависимостями
- [x] Создать `tsconfig.json` (strict mode, path alias @/*)
- [x] Создать `.gitignore`
- [x] Создать `.env.local.example`
- [x] Создать `postcss.config.mjs`
- [x] Создать `components.json` (shadcn/ui config)

### Step 2: TypeScript Types (`/types/index.ts`)
- [x] Создать все shared types: `MediaType`, `MediaStatus`, `MediaItem`, `Season`, `Episode`
- [x] Создать TMDB types: `TmdbSearchResult`, `TmdbDetails`, `TmdbSeason`, `TmdbEpisode`
- [x] Создать Database type для Supabase typed client
- [x] Создать `MediaFilters`, `SortOptions`, `WatchStats`
- [x] Создать label maps: `MEDIA_STATUS_LABELS`, `MEDIA_TYPE_LABELS`

### Step 3: Supabase Client Factory (`/lib/supabase/client.ts`)
- [x] Реализовать `createServerClient()` (@supabase/ssr, cookies)
- [x] Реализовать `createBrowserClient()` (browser singleton)

### Step 4: Middleware (`/middleware.ts`)
- [x] Auth guard: проверка сессии через supabase.auth.getUser()
- [x] Редирект неавторизованных → `/login`
- [x] Редирект авторизованных с `/login`/`/register` → `/library`
- [x] `matcher` конфиг: все пути кроме статических файлов

### Step 5: Global Styles & Theme (`/app/globals.css`)
- [x] Базовые Tailwind directives
- [x] CSS custom properties "Naruto grown-up" palette в :root
- [x] Status color vars
- [x] Scrollbar styling

### Step 6: Tailwind Config (`/tailwind.config.ts`)
- [x] Настроить content paths
- [x] Подключить tailwindcss-animate plugin
- [x] Добавить все цвета из CSS vars
- [x] Геист шрифт переменные

### Step 7: Root Layout (`/app/layout.tsx`)
- [x] Геист шрифт (geist package)
- [x] `<html lang="ru" className="dark">`
- [x] Подключение `globals.css`
- [x] Sonner Toaster с кастомной темой
- [x] Metadata (title "Last Episode")

### Step 8: Root Page (`/app/page.tsx`)
- [x] Server Component: redirect на `/library`

### Step 9: Auth Layout (`/app/(auth)/layout.tsx`)
- [x] Центрированный layout: flex min-h-screen items-center justify-center

### Step 10: Login Page (`/app/(auth)/login/page.tsx`)
- [x] Client Component с полями email/password
- [x] data-testid атрибуты на всех элементах
- [x] supabase.auth.signInWithPassword() + error mapping
- [x] Ссылка на /register

### Step 11: Register Page (`/app/(auth)/register/page.tsx`)
- [x] Client Component с email/password/confirmPassword
- [x] Валидация: длина пароля + совпадение
- [x] data-testid атрибуты
- [x] supabase.auth.signUp() + error mapping

### Step 12: App Layout (`/app/(app)/layout.tsx`)
- [x] Server Component: getUser() + redirect если нет сессии
- [x] Navbar с userEmail prop
- [x] container max-w-7xl layout

### Step 13: Navbar (`/components/Navbar.tsx`)
- [x] Client Component с usePathname() active route
- [x] Лого "LAST EPISODE" в primary цвете
- [x] Иконки: Film, Search, BarChart2 (lucide-react)
- [x] Кнопка выхода с LogOut иконкой
- [x] data-testid на всех элементах
- [x] Backdrop blur sticky header

### Step 14: Database Migration
- [x] `supabase/migrations/20260317000000_initial_schema.sql`
- [x] Таблицы: media_items, seasons, episodes с constraints
- [x] 6 индексов для performance
- [x] updated_at trigger
- [x] RLS enable + все policies (4 для media_items, 1 для seasons, 1 для episodes)

### Step 15: Shared UI Utilities (`/lib/utils.ts`)
- [x] cn() helper (clsx + tailwind-merge)

### Step 16: next.config.ts
- [x] images.remotePatterns для image.tmdb.org

### Step 17: Documentation
- [x] aidlc-docs/construction/unit1-foundation/code/code-summary.md

---

## Story Traceability
- [x] FR-01: Steps 3, 4, 10, 11, 12, 13 (auth flows + route protection)
- [x] NFR-02: Steps 5, 6, 7 (dark theme)
- [x] NFR-04: Steps 1, 14 (deploy config + migrations)
- [x] NFR-05: Steps 5, 6 (design system)