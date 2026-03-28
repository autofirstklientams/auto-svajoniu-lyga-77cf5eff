
CREATE TABLE public.ai_feature_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.ai_feature_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ai access" ON public.ai_feature_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can check own ai access" ON public.ai_feature_access
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
