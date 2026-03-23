# Code Generation Plan — Unit 7: Social Layer

## Unit Context
- **Unit Name**: Social Layer
- **Stories**: Регистрация с username, поиск пользователей, публичный профиль
- **Dependencies**: Unit 1 (Auth), Unit 4 (Statistics)
- **Workspace Root**: /Users/hornysennin/Desktop/projects/last-episode

## Steps

- [x] Step 1: Database Migration — `supabase/migrations/20260323000000_profiles.sql`
  - Таблица `profiles`, RLS policies, триггер `on_auth_user_created`

- [x] Step 2: TypeScript Types — `types/index.ts`
  - Добавить интерфейс `Profile`
  - Добавить `profiles` в тип `Database`

- [x] Step 3: Register Page — `app/(auth)/register/page.tsx`
  - Добавить поле `username` с валидацией regex
  - Передавать username в `signUp({ options: { data: { username } } })`

- [x] Step 4: App Layout — `app/(app)/layout.tsx`
  - Запрашивать `profiles` для текущего пользователя
  - Передавать `username` (или email как fallback) в Navbar

- [x] Step 5: Navbar — `components/Navbar.tsx`
  - Изменить prop `userEmail` → `username`
  - Переименовать "Поиск" → "Добавить" (PlusCircle)
  - Добавить "Сообщество" → `/community` (Users)
  - Отображать `@username` со ссылкой на `/profile/[username]`

- [x] Step 6: Server Actions — `app/actions/users.ts`
  - `searchUsers(query)`: ilike поиск по username
  - `getUserProfile(username)`: профиль + media_items (service role) + stats

- [x] Step 7: Community Page — `app/(app)/community/page.tsx`
  - Server Component, force-dynamic
  - Рендерит `UserSearchInput`

- [x] Step 8: UserSearchInput — `components/community/UserSearchInput.tsx`
  - Client Component, debounce 300ms
  - Вызывает `searchUsers`, рендерит `UserCard`

- [x] Step 9: UserCard — `components/community/UserCard.tsx`
  - Карточка профиля, ссылка на `/profile/[username]`

- [x] Step 10: ProfileMediaCard — `components/profile/ProfileMediaCard.tsx`
  - Read-only версия MediaCard (без удаления)

- [x] Step 11: Profile Page — `app/(app)/profile/[username]/page.tsx`
  - Server Component, force-dynamic
  - Шапка профиля + Stats + Library grid