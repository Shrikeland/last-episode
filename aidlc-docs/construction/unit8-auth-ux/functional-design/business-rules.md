# Business Rules — Unit 8: Auth UX Improvement

## BR-1: Форма скрывается после успешной отправки
После `supabase.auth.signUp()` без ошибки (data.session == null) форма полностью заменяется success-state.
Пользователь не может повторно отправить форму без перезагрузки страницы.

## BR-2: Inline ошибки вместо toast
Все ошибки регистрации (email занят, пароли не совпадают, слабый пароль) отображаются inline под формой.
Toast используется только для валидационных подсказок формата полей.

## BR-3: Callback обязан обрабатывать code
Route `/auth/callback` принимает `?code=` параметр и выполняет PKCE exchange.
При отсутствии code или ошибке → редирект на `/register?error=confirmation_failed`.

## BR-4: Email-confirmed страница доступна без сессии
Страница `/email-confirmed` является публичной (не требует auth), т.к. сессия только что создана.

## BR-5: Ссылка на login
На странице `/email-confirmed` слово "авторизоваться" является ссылкой на `/login`.