-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true);

-- Allow authenticated users to upload their own car images
CREATE POLICY "Partners can upload car images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'car-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow partners to update their own car images
CREATE POLICY "Partners can update their car images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'car-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow partners to delete their own car images
CREATE POLICY "Partners can delete their car images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'car-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view car images (public bucket)
CREATE POLICY "Anyone can view car images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'car-images');