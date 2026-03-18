# Unit of Work — Functional Requirements Map

User Stories пропущены (solo personal project). Вместо stories — Functional Requirements (FR) из requirements.md.

## FR → Unit Mapping

| FR | Описание | Unit |
|---|---|---|
| FR-01 | Аутентификация (email/password, login, register, logout) | Unit 1: Foundation |
| FR-02 | Поиск и добавление контента через TMDB API | Unit 2: Media Library |
| FR-03 | Управление коллекцией (просмотр сетки, удаление) | Unit 2: Media Library |
| FR-04 | Статусы просмотра (5 статусов, смена статуса) | Unit 3: Title Detail + Progress |
| FR-05 | Отслеживание прогресса (сезоны/эпизоды, runtime из TMDB) | Unit 3: Title Detail + Progress |
| FR-06 | Оценка (1–10) и личные заметки | Unit 3: Title Detail + Progress |
| FR-07 | Жанры из TMDB (отображение, использование в фильтрации) | Unit 2: Media Library |
| FR-08 | Поиск и фильтрация коллекции (статус, тип, жанр, оценка) | Unit 2: Media Library |
| FR-09 | Страница тайтла (постер, описание, метаданные) | Unit 3: Title Detail + Progress |
| FR-10 | Статистика просмотра (время, разбивка, топ жанры) | Unit 4: Statistics |

## NFR → Unit Mapping

| NFR | Описание | Unit |
|---|---|---|
| NFR-01 | Производительность (индексы Supabase, debounce) | Unit 1 (индексы) + Unit 2 (debounce) |
| NFR-02 | UX / Тёмная тема / Оптимистичные обновления | Unit 1 (тема) + Unit 3 (optimistic) |
| NFR-03 | RLS, обработка ошибок TMDB | Unit 1 (RLS) + Unit 2 (TMDB errors) |
| NFR-04 | Деплой Vercel + Supabase Cloud | Unit 1 (env vars, конфиг) |
| NFR-05 | Дизайн-система "Naruto grown-up" + Aceternity UI | Unit 1 (тема) + Unit 2 (CardSpotlight) + Unit 3 (Glow) |

## Coverage Check

- Все 10 FR покрыты: ✅
- Все 4 Unit'а имеют FR: ✅
- Нет FR без Unit'а: ✅
- Нет Unit'а без FR: ✅