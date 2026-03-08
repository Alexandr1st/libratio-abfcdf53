
-- Polls table
CREATE TABLE public.club_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Голосование за следующую книгу',
  is_active boolean NOT NULL DEFAULT true,
  allow_multiple boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Poll options (each option is a book)
CREATE TABLE public.club_poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.club_polls(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Votes
CREATE TABLE public.club_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.club_polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.club_poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- RLS
ALTER TABLE public.club_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: club members can view
CREATE POLICY "Club members can view polls" ON public.club_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_polls.club_id
        AND club_members.user_id = auth.uid()
    )
  );

-- Polls: club admins can create
CREATE POLICY "Club admins can create polls" ON public.club_polls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_polls.club_id
        AND club_members.user_id = auth.uid()
        AND club_members.is_admin = true
    )
  );

-- Polls: club admins can update
CREATE POLICY "Club admins can update polls" ON public.club_polls
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_polls.club_id
        AND club_members.user_id = auth.uid()
        AND club_members.is_admin = true
    )
  );

-- Polls: club admins can delete
CREATE POLICY "Club admins can delete polls" ON public.club_polls
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_members.club_id = club_polls.club_id
        AND club_members.user_id = auth.uid()
        AND club_members.is_admin = true
    )
  );

-- Poll options: viewable by club members (via poll -> club)
CREATE POLICY "Club members can view poll options" ON public.club_poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_polls p
      JOIN public.club_members cm ON cm.club_id = p.club_id
      WHERE p.id = club_poll_options.poll_id
        AND cm.user_id = auth.uid()
    )
  );

-- Poll options: club admins can manage
CREATE POLICY "Club admins can manage poll options" ON public.club_poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.club_polls p
      JOIN public.club_members cm ON cm.club_id = p.club_id
      WHERE p.id = club_poll_options.poll_id
        AND cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_polls p
      JOIN public.club_members cm ON cm.club_id = p.club_id
      WHERE p.id = club_poll_options.poll_id
        AND cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
  );

-- Votes: club members can view
CREATE POLICY "Club members can view votes" ON public.club_poll_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.club_polls p
      JOIN public.club_members cm ON cm.club_id = p.club_id
      WHERE p.id = club_poll_votes.poll_id
        AND cm.user_id = auth.uid()
    )
  );

-- Votes: members can insert their own vote
CREATE POLICY "Members can vote" ON public.club_poll_votes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.club_polls p
      JOIN public.club_members cm ON cm.club_id = p.club_id
      WHERE p.id = club_poll_votes.poll_id
        AND cm.user_id = auth.uid()
        AND p.is_active = true
    )
  );

-- Votes: members can delete their own vote
CREATE POLICY "Members can remove their vote" ON public.club_poll_votes
  FOR DELETE USING (auth.uid() = user_id);
