# Application Design Plan

## Execution Checkboxes

- [x] Analyze requirements context
- [x] Identify key functional areas:
  - Auth (login/register/session)
  - Media Library (collection grid, filtering)
  - TMDB Integration (search, metadata fetch)
  - Title Detail + Progress (seasons/episodes/watched state)
  - Statistics (runtime, breakdowns)
- [x] Determine design decisions:
  - TMDB API key защищён через Next.js Server Actions (не expose клиенту)
  - State management: local useState + URL search params для фильтров (без Zustand для MVP)
  - Rendering: Server Components для страниц с данными, Client Components для интерактивных элементов
  - Auth: Supabase SSR (@supabase/ssr) + middleware для защиты роутов
- [x] Generate components.md
- [x] Generate component-methods.md
- [x] Generate services.md
- [x] Generate component-dependency.md
- [x] Generate application-design.md (consolidated)