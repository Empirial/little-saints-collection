-- Create a public storage bucket for book assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-assets', 'book-assets', true);

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for book assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-assets');

-- Allow authenticated uploads (for admin use)
CREATE POLICY "Authenticated users can upload book assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'book-assets');