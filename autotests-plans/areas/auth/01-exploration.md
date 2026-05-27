# Auth Area — Exploration

## Цель области

Аутентификация — критический путь. Без работающего login невозможна ни одна другая область. Цель: войти в аккаунт, зарегистрироваться, выйти, защитить маршруты от неавторизованного доступа.

## Карта страниц и компонентов

| Маршрут | Тип | Компонент |
|---------|-----|-----------|
| `/login` | Client Component (`'use client'`) | `app/(auth)/login/page.tsx` |
| `/register` | Client Component (`'use client'`) | `app/(auth)/register/page.tsx` |
| `/email-confirmed` | Server Component | `app/(auth)/email-confirmed/page.tsx` |
| `/auth/callback` | API Route Handler | `app/auth/callback/route.ts` |

**Layout guard:** `app/(app)/layout.tsx` — Server Component, вызывает `getServerUser()`, при отсутствии пользователя делает `redirect('/login')`. Нет middleware.ts.

## Server Actions и хелперы

Авторизационные операции напрямую вызывают Supabase SDK:
- `supabase.auth.signInWithPassword({ email, password })` — login
- `supabase.auth.signUp({ email, password, options: { data: { username } } })` — register  
- `supabase.auth.exchangeCodeForSession(code)` — email confirmation callback
- `getServerUser()` из `lib/supabase/server.ts` (обёрнут в `React.cache`) — проверка сессии

## Пользовательские сценарии

### Happy path

| ID | Сценарий | Шаги |
|----|----------|------|
| AUTH-HP-1 | Успешный вход | `/login` → email + password → кнопка «Войти» → redirect `/library` |
| AUTH-HP-2 | Успешная регистрация | `/register` → username + email + password + confirm → «Зарегистрироваться» → показ экрана "письмо отправлено" |
| AUTH-HP-3 | Переход Login→Register | `/login` → ссылка «Зарегистрируйтесь» → URL `/register` |
| AUTH-HP-4 | Переход Register→Login | `/register` → ссылка «Войти» → URL `/login` |
| AUTH-HP-5 | Защищённый маршрут редиректит | `/library` (без сессии) → URL `/login` |
| AUTH-HP-6 | Подтверждение email | `/auth/callback?code=<code>` → redirect `/email-confirmed` |

### Edge cases / Error states

| ID | Сценарий | Шаги |
|----|----------|------|
| AUTH-ERR-1 | Неверный пароль | `/login` → правильный email, неверный пароль → toast "Неверный email или пароль" |
| AUTH-ERR-2 | Короткий пароль при регистрации | `/register` → password < 6 символов → inline ошибка + кнопка заблокирована до исправления |
| AUTH-ERR-3 | Несовпадающие пароли | `/register` → confirm ≠ password → inline ошибка + submit не проходит |
| AUTH-ERR-4 | Неверный формат username | `/register` → username с пробелом/спецсимволами → inline ошибка username |
| AUTH-ERR-5 | Пустая форма | `/login` → submit без заполнения → нет Supabase-вызова (HTML5 required) |

## Existing data-testid attributes

**Login page:**
- `data-testid="login-card"` — карточка
- `data-testid="login-form"` — форма
- `data-testid="login-email-input"` — поле email
- `data-testid="login-password-input"` — поле пароля
- `data-testid="login-submit-button"` — кнопка «Войти»
- `data-testid="login-register-link"` — ссылка на регистрацию

**Register page:**
- `data-testid="register-card"` — карточка
- `data-testid="register-form"` — форма
- `data-testid="register-username-input"` — поле username
- `data-testid="register-email-input"` — поле email
- `data-testid="register-password-input"` — поле пароля
- `data-testid="register-confirm-password-input"` — поле подтверждения пароля
- `data-testid="register-submit-button"` — кнопка
- `data-testid="register-login-link"` — ссылка на login
- `data-testid="register-form-error"` — блок с ошибкой формы

## Внешние зависимости

| Зависимость | Тип | Влияние на тест |
|-------------|-----|-----------------|
| Supabase Auth | Remote service | Реальный API-вызов при login/register. Нужна живая сессия при тестировании. |
| Email (SMTP) | Email delivery | Проверка email при регистрации не тестируется (нет доступа к почтовому ящику в тестах). Тест регистрации проверяет только UI-состояние "письмо отправлено". |

## Риски и open questions

1. **Сетевой доступ**: Как выявлено в SCAFFOLD, sandbox-среда не может достучаться до `www.episode.watch` (Vercel DDoS protection, 403). Тесты auth будут работать только из CI с разрешёнными IP или с локального запуска.
2. **Суперпользователь для тестов**: Учётные данные `hornysennin@gmail.com / QASenninMode94` нужны для login-теста. Этот пользователь должен существовать в Supabase. Тест регистрации не будет создавать реального пользователя (во избежание спама).
3. **Logout**: В кодовой базе нет явной кнопки logout в auth-страницах. Logout, скорее всего, находится в navbar — нужно проверить `components/Navbar.tsx` в следующей фазе.
4. **storageState**: После успешного login, storageState сохраняется для переиспользования в других тестах.
