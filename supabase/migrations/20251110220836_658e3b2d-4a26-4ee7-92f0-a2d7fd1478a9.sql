-- Create car_images table for multiple images per car
CREATE TABLE public.car_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view car images
CREATE POLICY "Anyone can view car images"
ON public.car_images
FOR SELECT
USING (true);

-- Partners can insert images for their own cars
CREATE POLICY "Partners can insert their car images"
ON public.car_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = car_images.car_id
    AND cars.partner_id = auth.uid()
  )
);

-- Partners can delete images for their own cars
CREATE POLICY "Partners can delete their car images"
ON public.car_images
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.cars
    WHERE cars.id = car_images.car_id
    AND cars.partner_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX idx_car_images_car_id ON public.car_images(car_id);
CREATE INDEX idx_car_images_display_order ON public.car_images(car_id, display_order);