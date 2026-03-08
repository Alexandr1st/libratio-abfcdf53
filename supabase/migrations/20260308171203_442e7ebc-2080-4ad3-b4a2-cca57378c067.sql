
-- Add status to club_polls: collecting (suggestions), voting (active), completed
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'collecting';

-- Add suggested_by to track who suggested each book
ALTER TABLE public.club_poll_options ADD COLUMN IF NOT EXISTS suggested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add winner_option_id to track the winning option
ALTER TABLE public.club_polls ADD COLUMN IF NOT EXISTS winner_option_id uuid REFERENCES public.club_poll_options(id);

-- Update RLS: allow any club member to insert poll options during collecting phase
DROP POLICY IF EXISTS "Club admins can manage poll options" ON public.club_poll_options;

CREATE POLICY "Club members can suggest books" ON public.club_poll_options
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM club_polls p
    JOIN club_members cm ON cm.club_id = p.club_id
    WHERE p.id = club_poll_options.poll_id
    AND cm.user_id = auth.uid()
    AND p.status = 'collecting'
  )
);

CREATE POLICY "Club admins can manage poll options" ON public.club_poll_options
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM club_polls p
    JOIN club_members cm ON cm.club_id = p.club_id
    WHERE p.id = club_poll_options.poll_id
    AND cm.user_id = auth.uid()
    AND cm.is_admin = true
  )
);

-- Allow users to delete their own suggestion during collecting
CREATE POLICY "Users can remove own suggestion" ON public.club_poll_options
FOR DELETE USING (
  suggested_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM club_polls p
    WHERE p.id = club_poll_options.poll_id
    AND p.status = 'collecting'
  )
);

-- Allow all club members to create polls (for auto-creation)
DROP POLICY IF EXISTS "Club admins can create polls" ON public.club_polls;
CREATE POLICY "Club members can create polls" ON public.club_polls
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.club_id = club_polls.club_id
    AND club_members.user_id = auth.uid()
  )
);
