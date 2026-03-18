# Infrastructure Design — Unit 1: Foundation

## Services

| Сервис | Провайдер | Назначение |
|---|---|---|
| Frontend hosting | Vercel | Next.js приложение |
| Database | Supabase Cloud (PostgreSQL) | Все таблицы приложения |
| Authentication | Supabase Auth | Email/password auth, JWT сессии |
| TMDB API | api.themoviedb.org | Метаданные тайтлов (Unit 2) |

## Environment Variables

### Vercel (Production + Preview)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
TMDB_API_KEY=<tmdb-api-key>          # server-only (без NEXT_PUBLIC_)
```

### .env.local (локальная разработка)
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
TMDB_API_KEY=<tmdb-api-key>
```

**Важно**: `TMDB_API_KEY` — без префикса `NEXT_PUBLIC_`, доступен только на сервере.

## Supabase Project Configuration

### Auth Settings (Dashboard → Authentication → Settings)
- Email Confirmations: **ОТКЛЮЧИТЬ** (personal project, не нужна верификация)
- Site URL: `https://<vercel-domain>.vercel.app`
- Redirect URLs: `https://<vercel-domain>.vercel.app/**`, `http://localhost:3000/**`

### Database
- Region: выбрать ближайший (EU Central или US East)
- Connection pooling: Transaction mode (для Vercel serverless)

## Supabase Migration: 001_initial_schema.sql

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- media_items
CREATE TABLE media_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id         INTEGER NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'anime')),
  title           TEXT NOT NULL,
  original_title  TEXT NOT NULL DEFAULT '',
  overview        TEXT NOT NULL DEFAULT '',
  poster_url      TEXT,
  release_year    INTEGER,
  genres          JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('watching','completed','planned','dropped','on_hold')),
  rating          INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes           TEXT,
  runtime_minutes INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- seasons
CREATE TABLE seasons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_item_id   UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  tmdb_season_id  INTEGER NOT NULL,
  season_number   INTEGER NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  episode_count   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(media_item_id, season_number)
);

-- episodes
CREATE TABLE episodes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_id       UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  tmdb_episode_id INTEGER NOT NULL,
  episode_number  INTEGER NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  runtime_minutes INTEGER,
  is_watched      BOOLEAN NOT NULL DEFAULT false,
  watched_at      TIMESTAMPTZ,
  UNIQUE(season_id, episode_number)
);

-- Indexes
CREATE INDEX idx_media_items_user_id ON media_items(user_id);
CREATE INDEX idx_media_items_status ON media_items(user_id, status);
CREATE INDEX idx_media_items_type ON media_items(user_id, type);
CREATE INDEX idx_seasons_media_item ON seasons(media_item_id);
CREATE INDEX idx_episodes_season ON episodes(season_id);
CREATE INDEX idx_episodes_watched ON episodes(season_id, is_watched);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: media_items
CREATE POLICY "select_own_media" ON media_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_media" ON media_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_media" ON media_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_media" ON media_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: seasons
CREATE POLICY "manage_own_seasons" ON seasons FOR ALL USING (
  EXISTS (SELECT 1 FROM media_items WHERE id = seasons.media_item_id AND user_id = auth.uid())
);

-- RLS Policies: episodes
CREATE POLICY "manage_own_episodes" ON episodes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM seasons
    JOIN media_items ON media_items.id = seasons.media_item_id
    WHERE seasons.id = episodes.season_id AND media_items.user_id = auth.uid()
  )
);
```