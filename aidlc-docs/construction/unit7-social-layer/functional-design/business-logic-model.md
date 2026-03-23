# Business Logic Model — Unit 7: Social Layer

## Поток регистрации с username

```
Пользователь заполняет форму
  └─► Валидация username клиентски (regex ^[a-z0-9_]{3,20}$)
  └─► supabase.auth.signUp({ email, password, options: { data: { username } } })
        └─► Supabase INSERT into auth.users
              └─► TRIGGER on_auth_user_created
                    └─► INSERT into public.profiles (id, username)
                          ├─► OK → profile создан
                          └─► UNIQUE violation → ошибка "Этот логин уже занят"
```

## Поиск пользователей

```
Пользователь вводит query в UserSearchInput (debounce 300ms)
  └─► searchUsers(query) — Server Action
        └─► supabase.from('profiles').ilike('username', '%query%').limit(20)
              └─► Возвращает Profile[]
                    └─► Рендерится список UserCard → /profile/[username]
```

## Публичный профиль

```
Открытие /profile/[username]
  └─► getUserProfile(username) — Server Action
        ├─► [1] supabase.from('profiles').eq('username', username).single()
        │         └─► Профиль не найден → notFound() (404)
        ├─► [2] if is_library_public = false → return { profile, mediaItems: [], stats: empty }
        └─► [3] service.from('media_items').eq('user_id', profile.id) [bypasses RLS]
                  └─► Вычислить stats через computeStats() (из lib/stats.ts)
                        └─► Рендер: ProfileHeader + StatsOverview + StatsBreakdown + GenreTopList + ProfileMediaCard grid
```

## Navbar

```
AppLayout (server)
  └─► supabase.from('profiles').eq('id', user.id).select('username').single()
        ├─► username найден → Navbar получает username=...
        └─► username не найден → Navbar получает username=user.email (fallback)
              └─► Navbar отображает @username со ссылкой на /profile/[username]
```