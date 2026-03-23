# Domain Entities — Unit 7: Social Layer

## Новые сущности

### Profile (`types/index.ts`)

```typescript
interface Profile {
  id: string            // = auth.users.id
  username: string      // уникальный логин, ^[a-z0-9_]{3,20}$
  avatar_url: string | null
  is_library_public: boolean  // задел на будущий тоггл приватности
  created_at: string
}
```

**Таблица БД**: `public.profiles`

| Поле | Тип | Описание |
|---|---|---|
| id | UUID PK | REFERENCES auth.users(id) ON DELETE CASCADE |
| username | TEXT UNIQUE NOT NULL | Формат: ^[a-z0-9_]{3,20}$ |
| avatar_url | TEXT | nullable, для будущего аватара |
| is_library_public | BOOLEAN | default true — управление видимостью библиотеки |
| created_at | TIMESTAMPTZ | автоматически NOW() |

---

## Изменения в существующих сущностях

### Database (`types/index.ts`)

Добавлена запись `profiles` в тип `Database.public.Tables`:

```typescript
profiles: {
  Row: Profile
  Insert: Omit<Profile, 'created_at'>
  Update: Partial<Omit<Profile, 'id' | 'created_at'>>
}
```

---

## Источники данных

| Источник | Роль |
|---|---|
| `profiles` (Supabase) | Поиск пользователей по username, получение профиля |
| `media_items` (Supabase, service role) | Чужая библиотека — читается через service role (обходит RLS) |
| `seasons` / `episodes` (Supabase, service role) | Статистика чужого профиля |
| `raw_user_meta_data` (auth.users) | Источник username при регистрации (через триггер) |