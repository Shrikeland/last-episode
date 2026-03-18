# Business Rules — Unit 1: Foundation

## Auth Validation Rules

### Email
- Обязательное поле
- Формат: валидный email (HTML5 type="email" + Supabase валидация)
- Уникальность: проверяется Supabase (ошибка "User already registered")

### Password
- Минимум 6 символов (минимум Supabase по умолчанию)
- Для Register: поле "Повторите пароль" должно совпадать с password (client-side)
- Хранится в виде bcrypt hash (Supabase управляет хранением)

### Error Messages (user-facing, без технических деталей)
| Ошибка Supabase | Сообщение пользователю |
|---|---|
| Invalid login credentials | Неверный email или пароль |
| User already registered | Пользователь с таким email уже существует |
| Password should be at least 6 characters | Пароль должен содержать минимум 6 символов |
| Network error | Проблема с соединением. Попробуйте снова |

## Route Protection Rules
- Все роуты кроме `/login`, `/register` — защищены (требуют авторизацию)
- Корневой путь `/` → redirect на `/library` (если авторизован) или `/login`
- Авторизованный пользователь на `/login` или `/register` → redirect на `/library`

## Database Constraints (Supabase)

### media_items
- `user_id` — NOT NULL, FK → auth.users(id) ON DELETE CASCADE
- `tmdb_id` — NOT NULL
- `type` — CHECK IN ('movie', 'tv', 'anime')
- `status` — CHECK IN ('watching', 'completed', 'planned', 'dropped', 'on_hold') DEFAULT 'planned'
- `rating` — CHECK BETWEEN 1 AND 10 (nullable)
- `UNIQUE(user_id, tmdb_id)` — один тайтл один раз в коллекции

### seasons
- `media_item_id` — NOT NULL, FK → media_items(id) ON DELETE CASCADE
- `season_number` — NOT NULL
- `UNIQUE(media_item_id, season_number)`

### episodes
- `season_id` — NOT NULL, FK → seasons(id) ON DELETE CASCADE
- `episode_number` — NOT NULL
- `is_watched` — DEFAULT false
- `UNIQUE(season_id, episode_number)`

## RLS Policies (Row Level Security)

### media_items
```sql
-- Пользователь видит только свои записи
CREATE POLICY "Users can view own media_items"
  ON media_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own media_items"
  ON media_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own media_items"
  ON media_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own media_items"
  ON media_items FOR DELETE
  USING (auth.uid() = user_id);
```

### seasons
```sql
-- Через JOIN на media_items → user_id
CREATE POLICY "Users can manage own seasons"
  ON seasons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM media_items
      WHERE media_items.id = seasons.media_item_id
        AND media_items.user_id = auth.uid()
    )
  );
```

### episodes (аналогично seasons через двойной JOIN)
```sql
CREATE POLICY "Users can manage own episodes"
  ON episodes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM seasons
      JOIN media_items ON media_items.id = seasons.media_item_id
      WHERE seasons.id = episodes.season_id
        AND media_items.user_id = auth.uid()
    )
  );
```