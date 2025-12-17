-- Add visibility columns to cars table
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS visible_web boolean NOT NULL DEFAULT true;
ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS visible_autoplius boolean NOT NULL DEFAULT false;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_cars_visible_web ON public.cars (visible_web) WHERE visible_web = true;
CREATE INDEX IF NOT EXISTS idx_cars_visible_autoplius ON public.cars (visible_autoplius) WHERE visible_autoplius = true;