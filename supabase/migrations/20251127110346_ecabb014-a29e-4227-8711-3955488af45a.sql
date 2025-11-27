-- Create storage bucket for club logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('club-logos', 'club-logos', true);

-- Create RLS policies for club logos bucket
CREATE POLICY "Anyone can view club logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'club-logos');

CREATE POLICY "Authenticated users can upload club logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'club-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Club contact persons can update their club logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'club-logos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Club contact persons can delete their club logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'club-logos' 
  AND auth.role() = 'authenticated'
);