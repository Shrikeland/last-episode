# Business Logic Model — Unit 8: Auth UX Improvement

## Registration Flow

1. Пользователь заполняет форму и нажимает "Зарегистрироваться"
2. Клиентская валидация (username, пароли)
3. `supabase.auth.signUp()` → ожидание ответа
4a. Ошибка (email занят, слабый пароль) → показать inline-ошибку под формой, форма остаётся
4b. Успех без сессии (email confirmation required) → скрыть форму, показать success-state по центру
4c. Успех с сессией (auto-confirm) → редирект на `/library`

## Email Confirmation Flow

1. Пользователь кликает ссылку в письме (Supabase шлёт `?code=XXX` на redirect URL)
2. `/auth/callback?code=XXX` → `supabase.auth.exchangeCodeForSession(code)`
3a. Успех → редирект на `/email-confirmed`
3b. Ошибка → редирект на `/register?error=confirmation_failed`

## Email Confirmed Page

- Статическая страница без авторизации
- Показывает сообщение об успехе
- Ссылка "авторизоваться" → `/login`