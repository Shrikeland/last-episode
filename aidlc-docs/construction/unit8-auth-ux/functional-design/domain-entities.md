# Domain Entities — Unit 8: Auth UX Improvement

## Entities

### RegistrationState
Клиентское состояние формы регистрации.
- `idle` — форма пустая, ожидает ввода
- `submitting` — запрос отправлен
- `submitted` — письмо отправлено, форма скрыта
- `error` — ошибка (inline)

### AuthCallbackResult
Результат обмена code на сессию (Supabase PKCE flow).
- `success` → редирект на `/email-confirmed`
- `error` → редирект на `/register?error=confirmation_failed`