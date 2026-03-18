# Frontend Components — Unit 5: Anime Filler Detection

## Изменения в существующих компонентах

### EpisodeRow (`components/media/EpisodeRow.tsx`)
Единственное визуальное изменение в Unit 5 — добавить бейдж "Филлер".

**Изменение props**: нет (поле `is_filler` уже есть в типе `Episode` после миграции)

**Новый элемент** между runtime и watched_at:
```
{episode.is_filler && (
  <Badge variant="outline" className="text-xs px-1.5 py-0 text-amber-500/70 border-amber-500/30">
    Филлер
  </Badge>
)}
```

**Итоговый layout EpisodeRow (слева направо):**
1. `Checkbox`
2. `E{episode_number}` — моноширинный
3. Название эпизода
4. `[Филлер]` — бейдж (если `is_filler = true`)
5. Runtime (если есть)
6. Дата просмотра (если просмотрен)

`data-testid="episode-filler-badge-{id}"` на бейдже.

---

## Никаких новых компонентов в Unit 5

Вся логика — серверная (сервисы + Server Action). Фронтенд-изменение минимально:
только бейдж в `EpisodeRow`.

---

## Будущие улучшения (вне scope Unit 5)

- **Фильтр "скрыть филлеры"** в `SeasonAccordion` — toggle, скрывающий строки с `is_filler = true`
- **Кнопка "Обновить данные о филлерах"** на странице тайтла — для повторного запроса
  при `status = 'error'` или для старых тайтлов
- **Ручная разметка** — чекбокс "Филлер" в `EpisodeRow` для тайтлов, которые не нашлись