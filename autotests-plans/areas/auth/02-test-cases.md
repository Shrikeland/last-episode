# Auth Area — Test Cases

> Generated in TEST_CASES phase. Each case covers both manual QA and Playwright automation.

## TC-AUTH-001 — Login: happy path

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-001 |
| **Title** | Успешный вход с корректными credentials |
| **Priority** | P0 |
| **Preconditions** | Пользователь `hornysennin@gmail.com` существует в Supabase. Пользователь не авторизован. |
| **Steps** | 1. Открыть `/login` <br> 2. В поле Email ввести `hornysennin@gmail.com` <br> 3. В поле «Пароль» ввести `QASenninMode94` <br> 4. Нажать кнопку «Войти» |
| **Expected result** | URL меняется на `/library`. Navbar отображает имя пользователя. |
| **Test data** | email: `hornysennin@gmail.com`, password: `QASenninMode94` |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-002 — Login: invalid credentials

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-002 |
| **Title** | Вход с неверным паролем показывает ошибку |
| **Priority** | P0 |
| **Preconditions** | Пользователь `hornysennin@gmail.com` существует. Пользователь не авторизован. |
| **Steps** | 1. Открыть `/login` <br> 2. Ввести email `hornysennin@gmail.com` <br> 3. Ввести пароль `wrong-password` <br> 4. Нажать «Войти» |
| **Expected result** | Появляется toast с текстом «Неверный email или пароль». URL остаётся `/login`. |
| **Test data** | email: `hornysennin@gmail.com`, password: `wrong-password` |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-003 — Login: form validation (empty fields)

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-003 |
| **Title** | Форма не отправляется с пустыми полями |
| **Priority** | P1 |
| **Preconditions** | Пользователь не авторизован. Страница `/login` открыта. |
| **Steps** | 1. Нажать «Войти» без заполнения полей |
| **Expected result** | Форма не отправляется (HTML5 required validation). Никакого Supabase-запроса. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-004 — Protected route redirect

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-004 |
| **Title** | Неавторизованный пользователь редиректится на /login |
| **Priority** | P0 |
| **Preconditions** | Пользователь не авторизован (нет сессии в browser state). |
| **Steps** | 1. Напрямую открыть `/library` |
| **Expected result** | URL меняется на `/login`. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-005 — Login → Register navigation

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-005 |
| **Title** | Переход с Login на Register по ссылке |
| **Priority** | P1 |
| **Preconditions** | Страница `/login` открыта. |
| **Steps** | 1. Нажать ссылку «Зарегистрируйтесь» |
| **Expected result** | URL меняется на `/register`. Отображается форма регистрации. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-006 — Register → Login navigation

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-006 |
| **Title** | Переход с Register на Login по ссылке |
| **Priority** | P1 |
| **Preconditions** | Страница `/register` открыта. |
| **Steps** | 1. Нажать ссылку «Войти» |
| **Expected result** | URL меняется на `/login`. Отображается форма входа. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-007 — Register: validation — password too short

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-007 |
| **Title** | Inline ошибка при коротком пароле |
| **Priority** | P1 |
| **Preconditions** | Страница `/register` открыта. |
| **Steps** | 1. Ввести в поле «Пароль» значение `abc` (3 символа) |
| **Expected result** | Под полем пароля появляется текст «Минимум 6 символов». |
| **Test data** | password: `abc` |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-008 — Register: validation — passwords do not match

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-008 |
| **Title** | Inline ошибка при несовпадении паролей |
| **Priority** | P1 |
| **Preconditions** | Страница `/register` открыта. |
| **Steps** | 1. Ввести в «Пароль» значение `password123` <br> 2. Ввести в «Повторите пароль» значение `password456` |
| **Expected result** | Под полем «Повторите пароль» появляется текст «Пароли не совпадают». |
| **Test data** | password: `password123`, confirmPassword: `password456` |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-009 — Register: validation — invalid username

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-009 |
| **Title** | Inline ошибка при неверном формате username |
| **Priority** | P1 |
| **Preconditions** | Страница `/register` открыта. |
| **Steps** | 1. Ввести в поле «Логин» значение `my user` (с пробелом) |
| **Expected result** | Под полем появляется ошибка «Пробелы не допускаются...». |
| **Test data** | username: `my user` |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-010 — Logout

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-010 |
| **Title** | Авторизованный пользователь может выйти из системы |
| **Priority** | P0 |
| **Preconditions** | Пользователь авторизован (storageState от TC-AUTH-001). |
| **Steps** | 1. Открыть `/library` <br> 2. Нажать на аватар в Navbar <br> 3. Нажать «Выйти» |
| **Expected result** | URL меняется на `/login`. Защищённые страницы редиректят обратно на `/login`. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## TC-AUTH-011 — storageState: authenticated session reuse

| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-011 |
| **Title** | Сохранённая сессия позволяет открывать защищённые страницы без повторного логина |
| **Priority** | P0 |
| **Preconditions** | storageState сохранён после TC-AUTH-001. |
| **Steps** | 1. Открыть `/library` используя сохранённый storageState |
| **Expected result** | Страница `/library` загружается без редиректа на `/login`. |
| **Test data** | Нет |
| **Automation status** | NOT_AUTOMATED |

## Приоритизация для автоматизации (порядок реализации)

1. TC-AUTH-001 (login happy path + создание storageState) — фундамент
2. TC-AUTH-004 (protected route redirect)
3. TC-AUTH-011 (storageState reuse)
4. TC-AUTH-010 (logout)
5. TC-AUTH-002 (invalid credentials)
6. TC-AUTH-005, TC-AUTH-006 (navigation)
7. TC-AUTH-007, TC-AUTH-008, TC-AUTH-009 (form validation)
8. TC-AUTH-003 (empty form — lowest priority)
