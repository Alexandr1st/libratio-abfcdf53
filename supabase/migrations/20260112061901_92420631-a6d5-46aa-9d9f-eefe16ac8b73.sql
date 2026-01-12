-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view clubs" ON public.clubs;

-- Create a new policy for authenticated users only
CREATE POLICY "Authenticated users can view clubs" 
ON public.clubs 
FOR SELECT 
TO authenticated
USING (true);