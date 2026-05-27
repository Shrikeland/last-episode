# Search Area — Test Cases

## TC-SEARCH-001 — Search: results appear for valid query

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-001 |
| **Title** | Поиск возвращает результаты для корректного запроса |
| **Priority** | P0 |
| **Preconditions** | Пользователь авторизован (storageState). Страница `/search` открыта. |
| **Steps** | 1. Ввести "Breaking Bad" в поисковый ввод <br> 2. Подождать 600ms (debounce + ответ) |
| **Expected result** | Отображается хотя бы одна карточка результата. Поле поиска содержит "Breaking Bad". |
| **Test data** | query: `Breaking Bad` |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-002 — Search: empty results message

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-002 |
| **Title** | Поиск без результатов показывает сообщение |
| **Priority** | P1 |
| **Preconditions** | Пользователь авторизован. Страница `/search` открыта. |
| **Steps** | 1. Ввести заведомо уникальный запрос "xyzzy12345notfound" |
| **Expected result** | Текст «Ничего не найдено по запросу...» |
| **Test data** | query: `xyzzy12345notfound` |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-003 — Search: clear button resets state

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-003 |
| **Title** | Кнопка очистки сбрасывает запрос и результаты |
| **Priority** | P1 |
| **Preconditions** | Пользователь авторизован. Результаты поиска уже показаны. |
| **Steps** | 1. Ввести "Breaking Bad", дождаться результатов <br> 2. Нажать кнопку X (Очистить поиск) |
| **Expected result** | Поле ввода пустое, результаты исчезли, кнопка X скрыта. |
| **Test data** | query: `Breaking Bad` |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-004 — Search: add title dialog opens

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-004 |
| **Title** | Нажатие «Добавить» открывает диалог AddToLibrary |
| **Priority** | P0 |
| **Preconditions** | Результаты поиска показаны. Тайтл ещё не в библиотеке. |
| **Steps** | 1. Нажать «Добавить» на первой карточке результата |
| **Expected result** | Открывается модальный диалог с заголовком «Добавить в библиотеку». Виден select статуса. |
| **Test data** | — |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-005 — Search: add title to library (happy path)

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-005 |
| **Title** | Пользователь добавляет тайтл в библиотеку через диалог |
| **Priority** | P0 |
| **Preconditions** | Тайтл "Severance" (сериал, TMDB id стабилен) не в библиотеке. |
| **Steps** | 1. Найти "Severance" <br> 2. Нажать «Добавить» <br> 3. Оставить статус "Хочу посмотреть" <br> 4. Нажать «Сохранить» |
| **Expected result** | Диалог закрывается. Кнопка на карточке меняется на «Добавлено». Toast с текстом «добавлен в коллекцию». |
| **Test data** | query: `Severance` |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-006 — Search: cancel dialog does not add title

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-006 |
| **Title** | Отмена диалога не добавляет тайтл |
| **Priority** | P1 |
| **Preconditions** | Диалог открыт. |
| **Steps** | 1. Нажать «Отмена» в диалоге |
| **Expected result** | Диалог закрывается. Кнопка «Добавить» остаётся активной (не «Добавлено»). |
| **Test data** | — |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-007 — Search: already-in-library titles show "Добавлено"

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-007 |
| **Title** | Тайтл уже в библиотеке отображается как «Добавлено» |
| **Priority** | P1 |
| **Preconditions** | Тайтл уже добавлен в библиотеку (TC-SEARCH-005 выполнен). |
| **Steps** | 1. Найти тот же тайтл заново |
| **Expected result** | Кнопка сразу показывает «Добавлено» и задизейблена. |
| **Test data** | Тот же тайтл, что в TC-SEARCH-005 |
| **Automation status** | NOT_AUTOMATED |

## TC-SEARCH-008 — Search: protected route redirect

| Field | Value |
|-------|-------|
| **ID** | TC-SEARCH-008 |
| **Title** | Неавторизованный пользователь перенаправляется с /search |
| **Priority** | P0 |
| **Preconditions** | Пользователь не авторизован. |
| **Steps** | 1. Открыть `/search` |
| **Expected result** | Редирект на `/login`. |
| **Test data** | — |
| **Automation status** | NOT_AUTOMATED |
