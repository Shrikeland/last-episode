# Library Area — Test Cases

## TC-LIB-001 — Library loads with items

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-001 |
| **Title** | Библиотека загружается и показывает карточки |
| **Priority** | P0 |
| **Preconditions** | Авторизован. В библиотеке есть хотя бы один тайтл. |
| **Steps** | 1. Открыть `/library` |
| **Expected result** | Видна хотя бы одна карточка `data-testid^="media-card-"`. |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-002 — Filter by text

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-002 |
| **Title** | Фильтр по названию сужает результаты |
| **Priority** | P1 |
| **Preconditions** | В библиотеке есть хотя бы один тайтл. |
| **Steps** | 1. Открыть `/library` <br> 2. Ввести часть названия существующего тайтла в поле фильтра |
| **Expected result** | Количество карточек уменьшилось или осталось прежним. URL содержит search= |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-003 — Filter by status

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-003 |
| **Title** | Фильтр по статусу показывает только нужные тайтлы |
| **Priority** | P1 |
| **Preconditions** | В библиотеке есть тайтлы со статусом «Хочу посмотреть». |
| **Steps** | 1. Открыть `/library` <br> 2. Выбрать статус «Хочу посмотреть» в фильтре |
| **Expected result** | URL содержит status=planned. Результаты обновились. |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-004 — Delete item

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-004 |
| **Title** | Удаление тайтла из библиотеки через confirm dialog |
| **Priority** | P0 |
| **Preconditions** | В библиотеке есть хотя бы один тайтл. |
| **Steps** | 1. Открыть `/library` <br> 2. На первой карточке нажать кнопку удаления (корзина) <br> 3. В диалоге нажать «Удалить» |
| **Expected result** | Карточка исчезла из списка. |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-005 — Cancel delete

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-005 |
| **Title** | Отмена удаления сохраняет тайтл |
| **Priority** | P1 |
| **Preconditions** | В библиотеке есть хотя бы один тайтл. |
| **Steps** | 1. Нажать кнопку удаления <br> 2. В диалоге нажать «Отмена» |
| **Expected result** | Диалог закрылся, карточка осталась на месте. |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-006 — Click card navigates to detail

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-006 |
| **Title** | Клик на карточку ведёт на страницу деталей /media/[id] |
| **Priority** | P0 |
| **Preconditions** | В библиотеке есть хотя бы один тайтл. |
| **Steps** | 1. Кликнуть на постер/название первой карточки |
| **Expected result** | URL меняется на `/media/[id]`. |
| **Automation status** | NOT_AUTOMATED |

## TC-LIB-007 — Unauthenticated redirect

| Field | Value |
|-------|-------|
| **ID** | TC-LIB-007 |
| **Title** | Неавторизованный пользователь перенаправляется с /library |
| **Priority** | P0 |
| **Preconditions** | Пользователь не авторизован. |
| **Steps** | 1. Открыть `/library` |
| **Expected result** | Редирект на `/login`. |
| **Automation status** | NOT_AUTOMATED |
