-- Add more car parameters similar to Autoplius
ALTER TABLE public.cars
ADD COLUMN IF NOT EXISTS body_type text,
ADD COLUMN IF NOT EXISTS engine_capacity numeric,
ADD COLUMN IF NOT EXISTS power_kw integer,
ADD COLUMN IF NOT EXISTS doors integer,
ADD COLUMN IF NOT EXISTS seats integer,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS steering_wheel text,
ADD COLUMN IF NOT EXISTS condition text,
ADD COLUMN IF NOT EXISTS vin text,
ADD COLUMN IF NOT EXISTS defects text;