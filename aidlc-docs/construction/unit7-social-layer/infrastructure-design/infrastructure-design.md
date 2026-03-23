# Infrastructure Design — Unit 7: Social Layer

## База данных

### Новая таблица: `public.profiles`

```sql
CREATE TABLE public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT UNIQUE NOT NULL,
  avatar_url       TEXT,
  is_library_public BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_]{3,20}$')
);

CREATE INDEX profiles_username_idx ON public.profiles(username);
```

### RLS политики

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Все авторизованные пользователи могут читать профили
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Вставлять только свой профиль
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Обновлять только свой профиль
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
```

### Триггер: автосоздание профиля

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, LOWER(TRIM(NEW.raw_user_meta_data->>'username')));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Файл миграции
`supabase/migrations/20260323000000_profiles.sql`

---

## Server Actions

### `app/actions/users.ts`

| Функция | Описание | Клиент |
|---|---|---|
| `searchUsers(query)` | Поиск профилей по username (ilike, limit 20) | Server (RLS) |
| `getUserProfile(username)` | Профиль + media_items + stats для профиля | Server (RLS) + Service Role |

---

## Доступ к данным

### Чтение чужих media_items
- Используется `createServiceClient()` из `lib/supabase/service.ts`
- Существующая функция `getMediaItems(service, userId)` из `lib/supabase/media.ts`
- Существующая логика stats из `lib/stats.ts` + `computeStats()`
- **Нет изменений в существующем RLS** на `media_items` — service role обходит его

---

## Переменные окружения

Никаких новых переменных. Используется существующий `SUPABASE_SERVICE_ROLE_KEY`.

---

## Новые маршруты

| Маршрут | Тип | Описание |
|---|---|---|
| `/community` | Server Component | Поиск пользователей |
| `/profile/[username]` | Server Component | Публичный профиль |