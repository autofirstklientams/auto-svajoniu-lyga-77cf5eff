
CREATE TABLE public.all_listings_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.all_listings_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all listings access"
  ON public.all_listings_access
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can check own all listings access"
  ON public.all_listings_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_all_listings_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.all_listings_access WHERE user_id = _user_id
  )
$$;

-- Allow users with all_listings_access to update/delete any car
CREATE POLICY "All listings access can update any car"
  ON public.cars
  FOR UPDATE
  TO authenticated
  USING (public.has_all_listings_access(auth.uid()));

CREATE POLICY "All listings access can delete any car"
  ON public.cars
  FOR DELETE
  TO authenticated
  USING (public.has_all_listings_access(auth.uid()));

-- Update has_car_access function so granted users get full per-car operations too
CREATE OR REPLACE FUNCTION public.has_car_access(_user_id uuid, _car_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cars WHERE id = _car_id AND partner_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.car_access WHERE car_id = _car_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.all_listings_access WHERE user_id = _user_id
  )
$$;
