# Business Rules — Unit 2: Media Library

## TMDB Integration Rules
- TMDB API ключ доступен ТОЛЬКО на сервере (без NEXT_PUBLIC_ префикса)
- Все запросы к TMDB идут через Server Actions
- Язык запросов: `language=ru-RU` (русские названия и описания где возможно)
- Постер URL: `https://image.tmdb.org/t/p/w500{poster_path}` (null если poster_path отсутствует)
- Anime-определение: `genre_ids.includes(16) && origin_country.includes('JP')`
- Rate limiting TMDB: 50 запросов/сек — для MVP достаточно, обработка 429 ответа

## Media Item Constraints
- Уникальность: `(user_id, tmdb_id)` — один тайтл не может быть добавлен дважды
- При дублировании: возвращать понятную ошибку "Уже в вашей коллекции"
- Статус по умолчанию при добавлении: `'planned'`
- Жанры: массив строк, берётся из TMDB genres[].name (уже на русском при language=ru-RU)

## Filter Rules
- Все фильтры комбинируются через AND
- Поиск по названию: case-insensitive, ищет в title И original_title
- Фильтр 'all' для status/type = отсутствие фильтра
- По умолчанию: сортировка по created_at DESC (новые сверху)
- Фильтр по жанру: jsonb @> оператор (`genres @> '["Action"]'`)
- Фильтр по оценке: только тайтлы с rating IS NOT NULL при minRating/maxRating

## UI Rules
- Постер placeholder: при отсутствии poster_url показывать серый блок с иконкой Film
- Карточка показывает прогресс только для type='tv' или 'anime'
- Формат прогресса: "S2 · 5/13" или "завершено" если все серии отмечены
- Удаление только через confirmation dialog (необратимая операция)