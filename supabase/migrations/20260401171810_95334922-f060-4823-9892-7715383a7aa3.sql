
CREATE TABLE public.invoice_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoice access"
ON public.invoice_access
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can check own invoice access"
ON public.invoice_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Grant existing admins invoice access
INSERT INTO public.invoice_access (user_id, granted_by)
SELECT ur.user_id, ur.user_id
FROM public.user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT DO NOTHING;
