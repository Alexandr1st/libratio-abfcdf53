
-- Create club_messages table
CREATE TABLE public.club_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_club_messages_club_id ON public.club_messages(club_id, created_at);
CREATE INDEX idx_club_messages_pinned ON public.club_messages(club_id, is_pinned) WHERE is_pinned = true;

-- Enable RLS
ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

-- Club members can view messages
CREATE POLICY "Club members can view messages"
ON public.club_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_members.club_id = club_messages.club_id
    AND club_members.user_id = auth.uid()
  )
);

-- Club members can send messages
CREATE POLICY "Club members can send messages"
ON public.club_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_members.club_id = club_messages.club_id
    AND club_members.user_id = auth.uid()
  )
);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.club_messages
FOR DELETE
USING (sender_id = auth.uid());

-- Club admins can delete any message
CREATE POLICY "Club admins can delete any message"
ON public.club_messages
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_members.club_id = club_messages.club_id
    AND club_members.user_id = auth.uid()
    AND club_members.is_admin = true
  )
);

-- Club admins can pin/unpin messages (update is_pinned)
CREATE POLICY "Club admins can update messages"
ON public.club_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_members.club_id = club_messages.club_id
    AND club_members.user_id = auth.uid()
    AND club_members.is_admin = true
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.club_messages;
