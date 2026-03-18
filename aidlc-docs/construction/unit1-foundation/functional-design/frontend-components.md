# Frontend Components — Unit 1: Foundation

## RootLayout (`app/layout.tsx`)

**Type**: Server Component

**Props**: `{ children: React.ReactNode }`

**Responsibilities**:
- Загрузка Geist шрифта (next/font/google)
- Установка `<html lang="ru" className="dark">`
- Подключение globals.css (tweakcn CSS variables)
- Оборачивание в Toaster (shadcn/ui) для глобальных уведомлений

**State**: нет

---

## AuthLayout (`app/(auth)/layout.tsx`)

**Type**: Server Component

**Props**: `{ children: React.ReactNode }`

**Responsibilities**:
- Центрированный layout: flex items-center justify-center, min-h-screen
- Фоновый цвет `bg-background` (#0D1117)
- Карточка с `bg-card` (#1E2A3A), rounded-xl, shadow

**State**: нет

---

## AppLayout (`app/(app)/layout.tsx`)

**Type**: Server Component

**Props**: `{ children: React.ReactNode }`

**Responsibilities**:
- Получение текущего пользователя через createServerClient()
- Передача user в Navbar (для отображения email)
- Layout: flex flex-col min-h-screen
- Navbar сверху, контент под ним

**State**: нет

---

## LoginPage (`app/(auth)/login/page.tsx`)

**Type**: Client Component (`'use client'`)

**State**:
```typescript
email: string
password: string
isLoading: boolean
```

**User Interactions**:
1. Ввод email → обновление state
2. Ввод password → обновление state
3. Submit формы:
   - setIsLoading(true)
   - вызов supabase.auth.signInWithPassword()
   - успех → router.push('/library')
   - ошибка → toast.error(mapAuthError(error))
   - setIsLoading(false)
4. Клик "Нет аккаунта? Зарегистрируйтесь" → router.push('/register')

**Form Validation** (client-side, до submit):
- email: не пустое
- password: не пустое

**UI Structure**:
```
Card
  CardHeader: "Добро пожаловать" + subtitle
  CardContent:
    Form
      Input[type=email] label="Email"
      Input[type=password] label="Пароль"
      Button[type=submit] disabled={isLoading}
        "Войти" / Spinner
  CardFooter:
    Link → /register "Нет аккаунта? Зарегистрируйтесь"
```

---

## RegisterPage (`app/(auth)/register/page.tsx`)

**Type**: Client Component (`'use client'`)

**State**:
```typescript
email: string
password: string
confirmPassword: string
isLoading: boolean
```

**User Interactions**:
1. Submit:
   - Проверить password === confirmPassword (toast если нет)
   - setIsLoading(true)
   - вызов supabase.auth.signUp()
   - успех → router.push('/library')
   - ошибка → toast.error(mapAuthError(error))
2. Клик "Уже есть аккаунт?" → router.push('/login')

**Form Validation** (client-side):
- все поля не пустые
- password.length >= 6
- password === confirmPassword

---

## Navbar (`components/Navbar.tsx`)

**Type**: Client Component (`'use client'`)

**Props**:
```typescript
{ userEmail: string }
```

**User Interactions**:
1. Клик "Библиотека" → router.push('/library')
2. Клик "Поиск" → router.push('/search')
3. Клик "Статистика" → router.push('/stats')
4. Клик "Выйти":
   - вызов supabase.auth.signOut()
   - router.push('/login')

**Active Route Highlighting**: использует `usePathname()` для подсветки активного роута

**UI Structure**:
```
nav (bg-card, border-b border-border, sticky top-0)
  Container (max-w-7xl, px-4)
    Flex (justify-between, items-center, h-16)
      Logo: "LAST EPISODE" (текст, accent color — placeholder до финального лого)
      NavLinks:
        Link "Библиотека" (active highlight)
        Link "Поиск"
        Link "Статистика"
      UserMenu:
        span (text-muted) userEmail
        Button "Выйти" (variant=ghost, size=sm)
```