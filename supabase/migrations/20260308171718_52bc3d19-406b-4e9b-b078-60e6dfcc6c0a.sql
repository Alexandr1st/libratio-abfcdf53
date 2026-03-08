
-- Add date columns to club_polls
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS voting_starts_at timestamptz;
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS voting_ends_at timestamptz;
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS reading_starts_at timestamptz;
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS reading_ends_at timestamptz;

-- Update RLS: allow suggestions during collecting OR during reading period after voting
DROP POLICY IF EXISTS "Club members can suggest books" ON public.club_poll_options;
CREATE POLICY "Club members can suggest books" ON public.club_poll_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM club_polls p
    JOIN club_members cm ON cm.club_id = p.club_id
    WHERE p.id = club_poll_options.poll_id
    AND cm.user_id = auth.uid()
    AND (
      (p.voting_starts_at IS NULL OR now() < p.voting_starts_at)
      OR (p.voting_ends_at IS NOT NULL AND now() > p.voting_ends_at AND (p.reading_ends_at IS NULL OR now() <= p.reading_ends_at))
    )
  )
);

-- Update delete policy: allow removing suggestion before voting or during reading
DROP POLICY IF EXISTS "Users can remove own suggestion" ON public.club_poll_options;
CREATE POLICY "Users can remove own suggestion" ON public.club_poll_options
FOR DELETE USING (
  suggested_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM club_polls p
    WHERE p.id = club_poll_options.poll_id
    AND (
      (p.voting_starts_at IS NULL OR now() < p.voting_starts_at)
      OR (p.voting_ends_at IS NOT NULL AND now() > p.voting_ends_at AND (p.reading_ends_at IS NULL OR now() <= p.reading_ends_at))
    )
  )
);
