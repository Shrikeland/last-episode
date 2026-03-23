# Frontend Components — Unit 8: Auth UX Improvement

## Изменения в существующих компонентах

### app/(auth)/register/page.tsx (MODIFY)
- Добавить состояния: `submitted: boolean`, `formError: string | null`
- При `submitted === true` → рендерить `<RegistrationSuccessView email={email} />`
- Убрать все `toast.error` / `toast.info` → заменить на `setFormError(message)`
- `formError` отображается как `<p className="text-destructive text-sm text-center">` под кнопкой Submit
- Кнопка Submit заблокирована пока `isLoading === true`

## Новые компоненты

### RegistrationSuccessView (inline в register/page.tsx)
```
[Иконка MailCheck]
Письмо отправлено!
Проверьте {email} и нажмите на ссылку для подтверждения.
```
- Центрированный layout внутри того же `Card`
- Нет кнопок — пользователь уходит из страницы сам

### app/auth/callback/route.ts (NEW)
- GET handler
- Читает `searchParams.get('code')`
- Вызывает `supabase.auth.exchangeCodeForSession(code)`
- Redirect: success → `/email-confirmed`, error → `/register?error=confirmation_failed`

### app/(auth)/email-confirmed/page.tsx (NEW)
- Server Component (static)
- Card с иконкой CheckCircle
- Заголовок: "Email подтверждён!"
- Текст: "Вы успешно подтвердили почту. Теперь вы можете [авторизоваться](/login)."
- `авторизоваться` — `<Link href="/login">`