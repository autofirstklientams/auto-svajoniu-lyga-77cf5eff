-- Add column to mark car as company-owned (AutoKopers)
ALTER TABLE public.cars ADD COLUMN is_company_car boolean NOT NULL DEFAULT false;