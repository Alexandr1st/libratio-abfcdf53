-- Allow club contact persons to create diary entries for their club members
CREATE POLICY "Club contact persons can assign books to members"
ON public.diary_entries
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clubs c ON c.id = p.club_id
    WHERE p.id = diary_entries.user_id
    AND c.contact_person_id = auth.uid()
  )
);