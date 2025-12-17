-- Add additional Autoplius-compatible fields to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS euro_standard text;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS fuel_cons_urban numeric(3,1);
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS fuel_cons_highway numeric(3,1);
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS fuel_cons_combined numeric(3,1);
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS origin_country text;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS first_reg_date date;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS mot_date date;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS wheel_drive text;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS wheel_size text;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS co2_emission integer;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS city text DEFAULT 'Vilnius';
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS country text DEFAULT 'Lietuva';