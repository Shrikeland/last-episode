# Media Area — Test Cases

## TC-MEDIA-001 — Detail page loads

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-001 |
| **Priority** | P0 |
| **Title** | Страница деталей загружается и показывает название |
| **Preconditions** | Авторизован. В библиотеке есть хотя бы один TV-тайтл. |
| **Steps** | 1. Открыть `/library` → кликнуть на карточку → попасть на `/media/[id]` |
| **Expected result** | Страница содержит h1 с названием, status-select, rating-input. |
| **Automation status** | NOT_AUTOMATED |

## TC-MEDIA-002 — Change status

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-002 |
| **Priority** | P0 |
| **Title** | Изменение статуса сохраняется |
| **Preconditions** | Авторизован. Открыта страница деталей тайтла. |
| **Steps** | 1. Нажать на `status-select` <br> 2. Выбрать «Смотрю» |
| **Expected result** | Select отображает «Смотрю». После перезагрузки статус сохранён. |
| **Automation status** | NOT_AUTOMATED |

## TC-MEDIA-003 — Toggle episode watched

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-003 |
| **Priority** | P0 |
| **Title** | Отметка эпизода как просмотренного |
| **Preconditions** | Авторизован. Открыта страница TV-тайтла с сезонами. |
| **Steps** | 1. Открыть аккордеон первого сезона <br> 2. Кликнуть checkbox первого эпизода |
| **Expected result** | Checkbox становится checked. |
| **Automation status** | NOT_AUTOMATED |

## TC-MEDIA-004 — Mark season watched

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-004 |
| **Priority** | P0 |
| **Title** | Отметка целого сезона как просмотренного |
| **Preconditions** | Открыта страница TV-тайтла. |
| **Steps** | 1. Нажать кнопку «Сезон просмотрен» первого сезона |
| **Expected result** | Все эпизоды сезона становятся checked. |
| **Automation status** | NOT_AUTOMATED |

## TC-MEDIA-005 — Edit notes

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-005 |
| **Priority** | P1 |
| **Title** | Редактирование заметок сохраняется |
| **Preconditions** | Открыта страница деталей тайтла. |
| **Steps** | 1. Кликнуть на notes-editor <br> 2. Ввести текст "Тест заметки" <br> 3. Сохранить (click вне поля или кнопка) |
| **Expected result** | Заметка видна в редакторе после сохранения. |
| **Automation status** | NOT_AUTOMATED |

## TC-MEDIA-006 — Unauthenticated redirect

| Field | Value |
|-------|-------|
| **ID** | TC-MEDIA-006 |
| **Priority** | P0 |
| **Title** | Неавторизованный редирект с /media/[id] |
| **Preconditions** | Пользователь не авторизован. |
| **Steps** | 1. Открыть `/media/some-id` |
| **Expected result** | Редирект на `/login`. |
| **Automation status** | NOT_AUTOMATED |
