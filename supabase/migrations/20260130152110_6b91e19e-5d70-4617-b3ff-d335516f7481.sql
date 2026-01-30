-- Fix overly permissive storage policies for book-covers bucket
DROP POLICY IF EXISTS "Authenticated users can delete book covers" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update book covers" ON storage.objects;

-- Restrict book cover deletion and updates to admins only
CREATE POLICY "Admins can delete book covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can update book covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers' AND public.is_admin(auth.uid()));

-- Fix overly permissive storage policies for club-logos bucket
DROP POLICY IF EXISTS "Club contact persons can delete their club logos" ON storage.objects;
DROP POLICY IF EXISTS "Club contact persons can update their club logos" ON storage.objects;

-- Restrict club logo deletion and updates to club contact persons who own the logo
CREATE POLICY "Club contact persons can delete their club logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'club-logos' AND
  EXISTS (
    SELECT 1 FROM public.clubs
    WHERE clubs.contact_person_id = auth.uid()
    AND clubs.logo_url LIKE '%' || (storage.objects.name) || '%'
  )
);

CREATE POLICY "Club contact persons can update their club logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'club-logos' AND
  EXISTS (
    SELECT 1 FROM public.clubs
    WHERE clubs.contact_person_id = auth.uid()
    AND clubs.logo_url LIKE '%' || (storage.objects.name) || '%'
  )
);