
-- Tighten conversation creation: only allow if user adds themselves as participant
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
  OR true -- Allow initial creation, participant added right after
);

-- Actually, the issue is that we need to create conversation first, then add participants.
-- The simplest secure approach: use a function.
DROP POLICY "Authenticated users can create conversations" ON public.conversations;
DROP POLICY "Authenticated users can add participants" ON public.conversation_participants;

-- Function to find or create a conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
  current_user_id uuid := auth.uid();
BEGIN
  -- Find existing conversation between these two users
  SELECT cp1.conversation_id INTO conv_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = current_user_id
    AND cp2.user_id = other_user_id
  LIMIT 1;

  -- If no conversation exists, create one
  IF conv_id IS NULL THEN
    INSERT INTO conversations (id) VALUES (gen_random_uuid()) RETURNING id INTO conv_id;
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, current_user_id);
    INSERT INTO conversation_participants (conversation_id, user_id) VALUES (conv_id, other_user_id);
  END IF;

  RETURN conv_id;
END;
$$;
