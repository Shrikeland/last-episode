# Unit 9: Mark All Enhancement — Code Generation Plan

## Unit Context
- **Goal**: Улучшение UX функционала "Отметить всё" в детальной карточке тайтла
- **Scope**: Brownfield — изменение существующих файлов, добавление одной функции в lib

## Stories

- [x] S9.1: Кнопка "Отметить всё" / "Снять отметку" для всего тайтла напротив заголовка "Прогресс"
- [x] S9.2: Постоянный оранжевый бордер на кнопке сезона, когда все эпизоды сезона просмотрены
- [x] S9.3: Зелёная галочка с тултипом "Тайтл просмотрен" в секции Прогресс, когда весь тайтл отмечен

## Dependencies
- `lib/supabase/progress.ts` — существующие функции markAllEpisodesWatched
- `app/actions/progress.ts` — существующие server actions
- `components/media/SeasonAccordion.tsx` — клиентский компонент с optimistic UI

---

## Step 1: Добавить markAllEpisodesUnwatched в lib/supabase/progress.ts

**File**: `lib/supabase/progress.ts` (MODIFY)
**Action**: Добавить функцию `markAllEpisodesUnwatched` по аналогии с `markAllEpisodesWatched`

- [x] Step 1 complete

## Step 2: Добавить server action markAllTitle в app/actions/progress.ts

**File**: `app/actions/progress.ts` (MODIFY)
**Action**: Добавить экспортируемую функцию `markAllTitle(mediaItemId, isWatched)` которая вызывает нужную lib-функцию в зависимости от isWatched

- [x] Step 2 complete

## Step 3: Обновить SeasonAccordion.tsx — все три UI-улучшения

**File**: `components/media/SeasonAccordion.tsx` (MODIFY)
**Action**:
- Импортировать `markAllTitle` из actions и `CheckCircle2` из `lucide-react`
- Добавить `handleMarkAllTitle` функцию с optimistic update
- Обновить `mediaItemId: _mediaItemId` → `mediaItemId` (убрать leading underscore, теперь используется)
- В хедере "Прогресс": добавить flex-row с:
  - `<CheckCircle2>` с CSS-тултипом, видимым только когда `allTitleWatched === true`
  - Кнопка "Отметить всё" / "Снять отметку" справа
- На кнопках сезонов: добавить conditional class `border-orange-500` когда `allWatched === true`
- Добавить `data-testid` атрибуты на новые интерактивные элементы

- [x] Step 3 complete

## Step 4: Build Verification

**Action**: `npm run build` — убедиться в 0 ошибках TypeScript/Next.js

- [x] Step 4 complete

---

## Completion Criteria
- Все 4 шага выполнены и чекбоксы [x]
- Все 3 stories реализованы (S9.1, S9.2, S9.3)
- npm run build ✓ (0 errors)