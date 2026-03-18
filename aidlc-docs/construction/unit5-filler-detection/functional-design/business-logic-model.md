# Business Logic Model — Unit 5: Anime Filler Detection

## 1. Точка входа — расширение addMediaItem

```
addMediaItem(tmdbId, type):
  ... существующая логика ...
  if type === 'anime' AND result.item:
    void fetchAndApplyFillers(result.item.id, tmdbId, details.title, details.original_title, seasons)
    // fire-and-forget: не await, не блокирует ответ
```

---

## 2. fetchAndApplyFillers(mediaItemId, tmdbId, title, originalTitle, seasons)

```
1. createServiceClient() → supabaseAdmin  // Service Role key

2. Проверить anime_filler_cache WHERE tmdb_id = tmdbId
   → status = 'fetched':
       applyFillersToDB(supabaseAdmin, mediaItemId, tmdbId, seasons)
       return
   → status = 'not_found':
       return  // ничего не делаем
   → status = 'error' OR нет записи:
       продолжить попытку

3. parseResult = await fetchFillerList(tmdbId, title, originalTitle)
   → null (не найдено / ошибка):
       INSERT anime_filler_cache (tmdb_id, status='not_found'|'error', ...)
       return

4. INSERT INTO filler_episodes (tmdb_id, absolute_episode_number) VALUES (...)
   ON CONFLICT DO NOTHING

5. INSERT INTO anime_filler_cache (tmdb_id, status='fetched', source_url=...)

6. applyFillersToDB(supabaseAdmin, mediaItemId, tmdbId, seasons)
```

---

## 3. fetchFillerList(tmdbId, title, originalTitle): FillerParseResult | null

```
Попытка 1: прямой slug из title
  slug = normalizeToSlug(title)
  result = await tryFetchFromSlug(slug)
  if result: return result

Попытка 2: AniList titles
  anilistMatch = await searchAniList(title)
  if anilistMatch:
    for each candidate in [anilistMatch.titleRomaji, anilistMatch.titleEnglish]:
      slug = normalizeToSlug(candidate)
      result = await tryFetchFromSlug(slug)
      if result: return result

Попытка 3: полнотекстовый поиск на сайте
  result = await searchOnSite(title)
  if result: return result

return null
```

---

## 4. tryFetchFromSlug(slug): FillerParseResult | null

```
1. url = `https://www.anime-filler-list.com/anime/${slug}/`
2. res = await fetch(url)
3. if res.status === 404: return null
4. html = await res.text()
5. return parseFillerHtml(html, url)
```

---

## 5. searchAniList(title): AniListMatch | null

```
1. POST https://graphql.anilist.co
   query: { Media(search: title, type: ANIME) { idMal title { romaji english } } }
2. if error OR no results: return null
3. return { malId, titleRomaji, titleEnglish }
```

---

## 6. searchOnSite(title): FillerParseResult | null

```
1. url = `https://www.anime-filler-list.com/?s=${encodeURIComponent(title)}`
2. res = await fetch(url)
3. html = await res.text()
4. Парсим первый результат поиска → получаем slug
5. return tryFetchFromSlug(slug)
```

---

## 7. parseFillerHtml(html, sourceUrl): FillerParseResult | null

```
Ищем в HTML таблицу эпизодов:
  <tr> содержит <td>номер</td> и <td>тип</td>

Для каждой строки:
  episodeNumber = parseInt(td[0].text)
  episodeType = td[2].text.trim()
  if episodeType === 'Filler' OR episodeType === 'Mixed Canon/Filler':
    fillerEpisodeNumbers.push(episodeNumber)

if fillerEpisodeNumbers.length === 0 AND таблица пустая: return null

return { sourceUrl, fillerEpisodeNumbers }
```

---

## 8. applyFillersToDB(supabaseAdmin, mediaItemId, tmdbId, seasons)

```
1. SELECT absolute_episode_number FROM filler_episodes WHERE tmdb_id = tmdbId
   → fillerSet = new Set(numbers)

2. Вычислить маппинг абсолютных номеров → episode.id:
   absoluteOffset = 0
   for each season in seasons (ordered by season_number):
     for each episode in season.episodes (ordered by episode_number):
       absoluteNum = absoluteOffset + episode.episode_number
       if fillerSet.has(absoluteNum):
         fillerEpisodeIds.push(episode.id)
     absoluteOffset += season.episode_count

3. if fillerEpisodeIds.length > 0:
     UPDATE episodes SET is_filler = true WHERE id IN (fillerEpisodeIds)
```

---

## 9. normalizeToSlug(title): string

```
title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')   // убрать спецсимволы
  .trim()
  .replace(/\s+/g, '-')            // пробелы → дефисы
  .replace(/-+/g, '-')             // двойные дефисы → один
```

---

## 10. Диаграмма зависимостей

```
addMediaItem (actions/tmdb.ts)
  └── fetchAndApplyFillers (lib/filler/filler.service.ts)
        ├── fetchFillerList
        │     ├── tryFetchFromSlug → parseFillerHtml
        │     ├── searchAniList (lib/filler/anilist.ts)
        │     └── searchOnSite → tryFetchFromSlug
        └── applyFillersToDB
              └── createServiceClient (lib/supabase/service.ts)
```