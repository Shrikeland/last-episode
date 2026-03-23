# Frontend Components — Unit 7: Social Layer

## Изменённые компоненты

### `app/(auth)/register/page.tsx`
- **Добавлено**: поле `username` (первое в форме)
- `onChange` автоматически применяет `.toLowerCase()`
- Клиентская валидация regex перед submit
- `signUp` теперь передаёт `options: { data: { username } }`

### `components/Navbar.tsx`
- **Изменён prop**: `userEmail: string` → `username: string`
- `NAV_LINKS` обновлён: "Поиск" (Search иконка) → "Добавить" (PlusCircle иконка), добавлена ссылка "Сообщество" (Users иконка) → `/community`
- Активный state теперь учитывает вложенные маршруты (`pathname.startsWith(href + '/')`)
- User section: вместо email отображается `@username` со ссылкой на `/profile/[username]`

### `app/(app)/layout.tsx`
- Добавлен запрос `profiles` для получения username текущего пользователя
- Передаётся `username={profile?.username ?? user.email ?? ''}` в Navbar

---

## Новые компоненты

### `components/community/UserSearchInput.tsx` (Client Component)
- Input с дебаунсом 300ms
- При вводе вызывает Server Action `searchUsers(query)`
- Отображает список `UserCard` или сообщение "Пользователи не найдены"
- Loading spinner в правой части поля

### `components/community/UserCard.tsx` (Server Component)
- Карточка пользователя: аватар-заглушка (UserCircle2), `@username`, статус библиотеки
- Ссылка → `/profile/[username]`
- Hover: `hover:border-primary/40`

### `components/profile/ProfileMediaCard.tsx` (Server Component)
- Read-only версия `MediaCard` без кнопки удаления и без `Link`
- Отображает: постер, название, тип (Badge), статус (цветной текст), год
- Используется в сетке на странице профиля

---

## Новые страницы

### `app/(app)/community/page.tsx` (Server Component)
- `export const dynamic = 'force-dynamic'`
- Заголовок "Сообщество" + подзаголовок
- Рендерит `<UserSearchInput />`

### `app/(app)/profile/[username]/page.tsx` (Server Component)
- `export const dynamic = 'force-dynamic'`
- Params: `{ username: string }` (Promise в Next.js 16)
- Вызывает `getUserProfile(username)` → notFound() если нет
- Секции: ProfileHeader, Stats (StatsOverview + StatsBreakdown + GenreTopList), Library (сетка ProfileMediaCard)
- Если `is_library_public = false` → Lock иконка + "Библиотека скрыта пользователем"

---

## Переиспользуемые компоненты статистики

На странице профиля используются существующие компоненты без изменений:
- `StatsOverview` — общее время + разбивка по типам
- `StatsBreakdown` — разбивка по статусам
- `GenreTopList` — топ-5 жанров