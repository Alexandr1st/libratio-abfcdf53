-- 1. Remove overly broad public SELECT on diary_entries
DROP POLICY IF EXISTS "Anyone can view entries with opinions" ON public.diary_entries;

-- 2. Fix club_members privilege escalation
-- Security definer to avoid recursion when checking admin status
CREATE OR REPLACE FUNCTION public.is_club_admin(_club_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_members
    WHERE club_id = _club_id
      AND user_id = _user_id
      AND is_admin = true
  );
$$;

DROP POLICY IF EXISTS "Club admins can manage members" ON public.club_members;

CREATE POLICY "Club admins can update members"
ON public.club_members
FOR UPDATE
USING (public.is_club_admin(club_id, auth.uid()))
WITH CHECK (public.is_club_admin(club_id, auth.uid()));

CREATE POLICY "Club admins can delete members"
ON public.club_members
FOR DELETE
USING (public.is_club_admin(club_id, auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Club admins can insert members"
ON public.club_members
FOR INSERT
WITH CHECK (public.is_club_admin(club_id, auth.uid()));

-- 3. conversation_participants INSERT policy
CREATE POLICY "Users can add themselves to conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- 4. Restrict club-logos upload bucket
DROP POLICY IF EXISTS "Authenticated users can upload club logos" ON storage.objects;

CREATE POLICY "Club contact persons or admins can upload club logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'club-logos'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.clubs WHERE contact_person_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.club_members WHERE user_id = auth.uid() AND is_admin = true)
  )
);

-- 5. Realtime authorization for messages and club_messages
-- Restrict realtime subscription/broadcast to authorized topics
CREATE POLICY "Users receive realtime for own conversations"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (extension = 'postgres_changes')
  OR EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.user_id = auth.uid()
      AND cp.conversation_id::text = realtime.topic()
  )
  OR EXISTS (
    SELECT 1 FROM public.club_members cm
    WHERE cm.user_id = auth.uid()
      AND cm.club_id::text = realtime.topic()
  )
);
