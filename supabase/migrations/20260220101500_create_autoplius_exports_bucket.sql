-- Create private storage bucket for debug Autoplius XML exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('autoplius-exports', 'autoplius-exports', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can view own autoplius exports'
  ) THEN
    CREATE POLICY "Users can view own autoplius exports"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'autoplius-exports'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can upload own autoplius exports'
  ) THEN
    CREATE POLICY "Users can upload own autoplius exports"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'autoplius-exports'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update own autoplius exports'
  ) THEN
    CREATE POLICY "Users can update own autoplius exports"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'autoplius-exports'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'autoplius-exports'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete own autoplius exports'
  ) THEN
    CREATE POLICY "Users can delete own autoplius exports"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'autoplius-exports'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
