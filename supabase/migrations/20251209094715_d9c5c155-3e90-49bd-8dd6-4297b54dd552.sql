-- Allow club contact persons to view diary entries of their club members
CREATE POLICY "Club contact persons can view member diary entries"
ON public.diary_entries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clubs c ON c.id = p.club_id
    WHERE p.id = diary_entries.user_id
    AND c.contact_person_id = auth.uid()
  )
);