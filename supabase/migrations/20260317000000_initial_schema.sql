-- Last Episode — Initial Schema
-- Run: npx supabase db push

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE media_items (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
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
                    CHECK (status IN ('watching', 'completed', 'planned', 'dropped', 'on_hold')),
  rating          INTEGER CHECK (rating >= 1 AND rating <= 10),
  notes           TEXT,
  runtime_minutes INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT media_items_unique_user_tmdb UNIQUE (user_id, tmdb_id)
);

CREATE TABLE seasons (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  media_item_id   UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  tmdb_season_id  INTEGER NOT NULL,
  season_number   INTEGER NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  episode_count   INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT seasons_unique_item_season UNIQUE (media_item_id, season_number)
);

CREATE TABLE episodes (
  id              UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  season_id       UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  tmdb_episode_id INTEGER NOT NULL,
  episode_number  INTEGER NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  runtime_minutes INTEGER,
  is_watched      BOOLEAN NOT NULL DEFAULT false,
  watched_at      TIMESTAMPTZ,
  CONSTRAINT episodes_unique_season_episode UNIQUE (season_id, episode_number)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_media_items_user_id     ON media_items (user_id);
CREATE INDEX idx_media_items_user_status ON media_items (user_id, status);
CREATE INDEX idx_media_items_user_type   ON media_items (user_id, type);
CREATE INDEX idx_seasons_media_item      ON seasons (media_item_id);
CREATE INDEX idx_episodes_season         ON episodes (season_id);
CREATE INDEX idx_episodes_season_watched ON episodes (season_id, is_watched);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_media_items_updated_at
  BEFORE UPDATE ON media_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes     ENABLE ROW LEVEL SECURITY;

-- media_items: full isolation per user
CREATE POLICY "media_items_select" ON media_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "media_items_insert" ON media_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "media_items_update" ON media_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "media_items_delete" ON media_items FOR DELETE USING (auth.uid() = user_id);

-- seasons: access via parent media_item ownership
CREATE POLICY "seasons_all" ON seasons FOR ALL USING (
  EXISTS (
    SELECT 1 FROM media_items
    WHERE media_items.id = seasons.media_item_id
      AND media_items.user_id = auth.uid()
  )
);

-- episodes: access via parent season → media_item ownership
CREATE POLICY "episodes_all" ON episodes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM seasons
    JOIN media_items ON media_items.id = seasons.media_item_id
    WHERE seasons.id = episodes.season_id
      AND media_items.user_id = auth.uid()
  )
);