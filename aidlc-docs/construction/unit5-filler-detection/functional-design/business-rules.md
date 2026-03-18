# Business Rules — Unit 5: Anime Filler Detection

## BR-01: Область применения
- Фича применяется **только** к тайтлам с `type = 'anime'`
- Для `type = 'movie'` и `type = 'tv'` — полностью игнорируется
- Фильмы-аниме (у которых нет сезонов) — также игнорируются

## BR-02: Глобальность данных о филлерах
- Таблицы `filler_episodes` и `anime_filler_cache` — **без user_id**
- Данные получаются один раз и используются всеми пользователями
- Если пользователь А добавил "Наруто" и данные уже в кэше — пользователь Б
  при добавлении "Наруто" получает готовый результат без сетевых запросов

## BR-03: Graceful Degradation
- Ошибка на любом этапе (AniList недоступен, scraping упал, матч не найден)
  **не блокирует** добавление тайтла в коллекцию
- При ошибке: эпизоды создаются с `is_filler = false`, пишется запись
  в `anime_filler_cache` со статусом `error`
- Пользователь не видит сообщения об ошибке — только отсутствие бейджей

## BR-04: Иммутабельность кэша
- После записи `status = 'fetched'` или `status = 'not_found'` повторная
  попытка **не выполняется**
- Исключение: `status = 'error'` — повторить можно (будущая фича)
- Причина: данные о филлерах для вышедших аниме не меняются

## BR-05: Права доступа к глобальным таблицам
- Запись в `filler_episodes` и `anime_filler_cache` — **только через Service Role key**
  (`SUPABASE_SERVICE_ROLE_KEY`, server-only env var)
- Чтение для всех авторизованных пользователей (через anon key + RLS policy)
- Никогда не использовать Service Role key на клиенте

## BR-06: Абсолютная нумерация эпизодов
- anime-filler-list.com использует сплошную нумерацию (ep 1, 2, 3... N)
- Для матчинга вычисляем `absolute_episode_number`:
  ```
  absolute = sum(episode_count всех предыдущих сезонов) + episode.episode_number
  ```
- Пример: S1 имеет 26 эп., S2E3 → absolute = 26 + 3 = 29
- Сохраняем в `filler_episodes` именно абсолютный номер

## BR-07: Матчинг тайтлов
- Первая попытка: нормализовать TMDB `title` → slug (lowercase, пробелы→дефис,
  убрать спецсимволы) → проверить `anime-filler-list.com/anime/{slug}/`
- Вторая попытка: запрос к AniList GraphQL → получить `titleRomaji` и `titleEnglish`
  → нормализовать → проверить снова
- Третья попытка: поиск через `anime-filler-list.com/?s={title}` → взять первый результат
- Если все три попытки не дали результат → `status = 'not_found'`

## BR-08: Типы эпизодов
- anime-filler-list.com различает: Manga Canon, Anime Canon, Filler, Mixed Canon/Filler
- **`is_filler = true`**: только `Filler` и `Mixed Canon/Filler`
- **`is_filler = false`**: `Manga Canon` и `Anime Canon`
- `Anime Canon` не является филлером — это оригинальный материал, не противоречащий манге

## BR-09: Асинхронность
- `fetchAndApplyFillers` вызывается **после** создания эпизодов в БД
- Не блокирует ответ Server Action пользователю
- Реализуется через `void fetchAndApplyFillers(...)` без await в `addMediaItem`
  (fire-and-forget, ошибки логируются но не пробрасываются)

## BR-10: Применение к уже добавленным тайтлам
- Если аниме было добавлено до появления Unit 5 — `is_filler = false` на всех эпизодах
- Re-apply при повторном открытии страницы — **вне scope Unit 5**
  (отдельная фича: кнопка "Обновить данные о филлерах")