
-- Allow all authenticated users to view diary entries that have opinions (notes is not null)
CREATE POLICY "Anyone can view entries with opinions"
ON public.diary_entries
FOR SELECT
USING (notes IS NOT NULL AND rating IS NOT NULL);
