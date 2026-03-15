
-- Conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view conversations they participate in
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_participants.conversation_id = conversations.id
  AND conversation_participants.user_id = auth.uid()
));

-- RLS: Any authenticated user can create a conversation
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (true);

-- RLS: Participants can update conversation (updated_at)
CREATE POLICY "Participants can update conversations"
ON public.conversations FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_participants.conversation_id = conversations.id
  AND conversation_participants.user_id = auth.uid()
));

-- RLS: Users can view participants of their conversations
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants cp
  WHERE cp.conversation_id = conversation_participants.conversation_id
  AND cp.user_id = auth.uid()
));

-- RLS: Authenticated users can add participants
CREATE POLICY "Authenticated users can add participants"
ON public.conversation_participants FOR INSERT TO authenticated
WITH CHECK (true);

-- RLS: Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_participants.conversation_id = messages.conversation_id
  AND conversation_participants.user_id = auth.uid()
));

-- RLS: Users can send messages to their conversations
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- RLS: Users can update their own messages (for read_at)
CREATE POLICY "Users can update messages in own conversations"
ON public.messages FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.conversation_participants
  WHERE conversation_participants.conversation_id = messages.conversation_id
  AND conversation_participants.user_id = auth.uid()
));

-- Enable realtime on messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Index for performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
