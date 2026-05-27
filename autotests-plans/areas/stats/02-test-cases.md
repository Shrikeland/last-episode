# Stats Area — Test Cases

## TC-STATS-001 — Stats page loads

| Field | Value |
|-------|-------|
| **ID** | TC-STATS-001 |
| **Priority** | P0 |
| **Title** | Страница статистики загружается |
| **Preconditions** | Авторизован. Библиотека не пустая. |
| **Steps** | 1. Открыть `/stats` |
| **Expected result** | Видны заголовок «Статистика» и блок «Общее время просмотра». |
| **Automation status** | NOT_AUTOMATED |

## TC-STATS-002 — Unauthenticated redirect

| Field | Value |
|-------|-------|
| **ID** | TC-STATS-002 |
| **Priority** | P0 |
| **Title** | Неавторизованный редирект |
| **Preconditions** | Не авторизован. |
| **Steps** | 1. Открыть `/stats` |
| **Expected result** | Редирект на `/login`. |
| **Automation status** | NOT_AUTOMATED |
