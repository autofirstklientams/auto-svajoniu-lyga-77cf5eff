-- Create a rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.form_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  form_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_rate_limits_lookup 
  ON public.form_rate_limits (ip_hash, form_type, created_at);

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.form_rate_limits WHERE created_at < now() - interval '1 hour';
$$;

ALTER TABLE public.form_rate_limits ENABLE ROW LEVEL SECURITY;