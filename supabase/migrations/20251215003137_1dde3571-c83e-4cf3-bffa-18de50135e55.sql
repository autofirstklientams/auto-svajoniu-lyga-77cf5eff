-- Create invoices storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for invoices bucket
CREATE POLICY "Users can view their own invoices"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own invoices"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create uploaded_invoices table for tracking uploaded files
CREATE TABLE public.uploaded_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploaded_invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own uploaded invoices"
ON public.uploaded_invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploaded invoices"
ON public.uploaded_invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded invoices"
ON public.uploaded_invoices FOR DELETE
USING (auth.uid() = user_id);