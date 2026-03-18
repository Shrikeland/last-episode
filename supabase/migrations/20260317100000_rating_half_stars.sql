-- Last Episode — Rating: INTEGER → NUMERIC(3,1) for half-star support
-- Run: npx supabase db push

ALTER TABLE media_items
  ALTER COLUMN rating TYPE NUMERIC(3,1);

ALTER TABLE media_items
  DROP CONSTRAINT IF EXISTS media_items_rating_check;

ALTER TABLE media_items
  ADD CONSTRAINT media_items_rating_check
    CHECK (rating >= 1.0 AND rating <= 10.0);