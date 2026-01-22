-- Table for car comments/updates
CREATE TABLE public.car_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for car access (who can see/comment on which cars)
CREATE TABLE public.car_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  granted_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(car_id, user_id)
);

-- Enable RLS
ALTER TABLE public.car_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_access ENABLE ROW LEVEL SECURITY;

-- Function to check if user has access to a car (owner or granted access)
CREATE OR REPLACE FUNCTION public.has_car_access(_user_id UUID, _car_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- User is the car owner
    SELECT 1 FROM public.cars WHERE id = _car_id AND partner_id = _user_id
  ) OR EXISTS (
    -- User was granted access
    SELECT 1 FROM public.car_access WHERE car_id = _car_id AND user_id = _user_id
  ) OR EXISTS (
    -- User is admin
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- RLS for car_comments
CREATE POLICY "Users with access can view car comments"
ON public.car_comments FOR SELECT
USING (public.has_car_access(auth.uid(), car_id));

CREATE POLICY "Users with access can add comments"
ON public.car_comments FOR INSERT
WITH CHECK (public.has_car_access(auth.uid(), car_id) AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.car_comments FOR DELETE
USING (auth.uid() = user_id);

-- RLS for car_access
CREATE POLICY "Car owners can view access list"
ON public.car_access FOR SELECT
USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_id AND partner_id = auth.uid())
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Car owners can grant access"
ON public.car_access FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_id AND partner_id = auth.uid())
  AND auth.uid() = granted_by
);

CREATE POLICY "Car owners can revoke access"
ON public.car_access FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.cars WHERE id = car_id AND partner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);