-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true);

-- Allow authenticated users to upload book covers
CREATE POLICY "Authenticated users can upload book covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- Allow anyone to view book covers (public bucket)
CREATE POLICY "Anyone can view book covers"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- Allow authenticated users to update their uploaded covers
CREATE POLICY "Authenticated users can update book covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers');

-- Allow authenticated users to delete book covers
CREATE POLICY "Authenticated users can delete book covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');