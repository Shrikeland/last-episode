-- Add status field to friendships for request/accept workflow
ALTER TABLE public.friendships
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
    CONSTRAINT friendships_status_check CHECK (status IN ('pending', 'accepted'));

-- Drop previous narrow policies
DROP POLICY IF EXISTS "Users can view own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can add friends" ON public.friendships;
DROP POLICY IF EXISTS "Users can remove friends" ON public.friendships;

-- Both sides can view their friendships (outgoing + incoming)
CREATE POLICY "Users can view their friendships"
  ON public.friendships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Only the requester can create a friendship record
CREATE POLICY "Users can send friend requests"
  ON public.friendships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only the recipient can accept (update status)
CREATE POLICY "Recipients can accept requests"
  ON public.friendships FOR UPDATE
  TO authenticated
  USING (friend_id = auth.uid())
  WITH CHECK (friend_id = auth.uid() AND status = 'accepted');

-- Either side can cancel / decline / remove
CREATE POLICY "Users can cancel or decline"
  ON public.friendships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());
