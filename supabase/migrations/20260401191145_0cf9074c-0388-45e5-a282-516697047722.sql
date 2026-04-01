
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Partners can insert their car images" ON public.car_images;
DROP POLICY IF EXISTS "Partners can update their car images" ON public.car_images;
DROP POLICY IF EXISTS "Partners can delete their car images" ON public.car_images;

-- Recreate with car_access support using has_car_access function
CREATE POLICY "Users with access can insert car images"
ON public.car_images
FOR INSERT
TO authenticated
WITH CHECK (has_car_access(auth.uid(), car_id));

CREATE POLICY "Users with access can update car images"
ON public.car_images
FOR UPDATE
TO authenticated
USING (has_car_access(auth.uid(), car_id))
WITH CHECK (has_car_access(auth.uid(), car_id));

CREATE POLICY "Users with access can delete car images"
ON public.car_images
FOR DELETE
TO authenticated
USING (has_car_access(auth.uid(), car_id));
