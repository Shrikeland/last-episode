# Business Logic Model — Unit 1: Foundation

## Auth Flows

### Register Flow
```
1. Пользователь вводит email + password + confirm password
2. Валидация на клиенте (see business-rules.md)
3. Вызов supabase.auth.signUp({ email, password })
4. Supabase создаёт пользователя
   - Email confirmation ОТКЛЮЧЕНА в Supabase Dashboard (personal project)
5. Автоматически выполняется вход (session создаётся)
6. Редирект на /library
7. При ошибке (email занят, слабый пароль) — показать toast с сообщением
```

### Login Flow
```
1. Пользователь вводит email + password
2. Вызов supabase.auth.signInWithPassword({ email, password })
3. Supabase валидирует credentials
4. При успехе: session записывается в cookies (через @supabase/ssr)
5. Редирект на /library (или на изначально запрошенный URL)
6. При ошибке: показать toast "Неверный email или пароль"
```

### Logout Flow
```
1. Пользователь кликает "Выйти" в Navbar
2. Вызов supabase.auth.signOut()
3. Supabase удаляет session из cookies
4. Редирект на /login
```

### Session Management
```
- @supabase/ssr читает/пишет session из cookies
- createServerClient() — для Server Components и Server Actions (read cookies)
- createBrowserClient() — для Client Components (браузер)
- Refresh токена происходит автоматически при каждом server-side запросе
```

## Middleware — Route Protection Logic
```
Выполняется на каждый запрос (middleware.ts):

1. Создать Supabase server client с доступом к cookies
2. Вызвать supabase.auth.getSession() для обновления сессии (обязательно для refresh)
3. Получить пользователя через supabase.auth.getUser()

4. Если pathname начинается с /login или /register:
   - Если пользователь авторизован → редирект на /library
   - Если нет → пропустить запрос

5. Если pathname НЕ /login и НЕ /register (т.е. защищённый роут):
   - Если пользователь НЕ авторизован → редирект на /login
   - Если авторизован → пропустить запрос
```

## Theme Setup Logic
```
- tweakcn генерирует CSS custom properties для shadcn/ui токенов
- Применяется через globals.css (class="dark" на <html>)
- Цветовая палитра из requirements NFR-05
- Geist font загружается через next/font/google в RootLayout
```