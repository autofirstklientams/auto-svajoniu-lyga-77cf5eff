CREATE POLICY "Partners can update their car images"
ON public.car_images
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.cars
  WHERE cars.id = car_images.car_id
    AND cars.partner_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.cars
  WHERE cars.id = car_images.car_id
    AND cars.partner_id = auth.uid()
));