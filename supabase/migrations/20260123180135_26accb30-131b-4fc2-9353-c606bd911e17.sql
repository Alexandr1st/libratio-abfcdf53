-- Drop the overly permissive policies on books table
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;

-- Create new policies that restrict book management to admins only
CREATE POLICY "Admins can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update books"
ON public.books
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));