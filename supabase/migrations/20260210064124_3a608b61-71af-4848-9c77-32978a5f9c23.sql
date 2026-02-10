-- Restrict club_books SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can view club books" ON public.club_books;

CREATE POLICY "Authenticated users can view club books"
ON public.club_books
FOR SELECT
TO authenticated
USING (true);