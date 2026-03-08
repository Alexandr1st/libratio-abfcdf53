CREATE POLICY "Club admins can manage books via club_members"
ON public.club_books
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.club_id = club_books.club_id
    AND club_members.user_id = auth.uid()
    AND club_members.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM club_members
    WHERE club_members.club_id = club_books.club_id
    AND club_members.user_id = auth.uid()
    AND club_members.is_admin = true
  )
);