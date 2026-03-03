-- Add sdk_code column to cars table for Autoplius SDK code
ALTER TABLE public.cars ADD COLUMN sdk_code varchar(10) DEFAULT NULL;