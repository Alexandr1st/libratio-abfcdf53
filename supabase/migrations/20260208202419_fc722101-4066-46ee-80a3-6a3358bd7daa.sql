-- Fix overly permissive clubs INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create clubs" ON public.clubs;

-- Only admins can create clubs
CREATE POLICY "Admins can create clubs"
ON public.clubs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));