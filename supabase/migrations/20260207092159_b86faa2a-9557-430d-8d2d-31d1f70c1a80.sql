-- Add is_reserved flag to cars table
ALTER TABLE public.cars ADD COLUMN is_reserved boolean NOT NULL DEFAULT false;