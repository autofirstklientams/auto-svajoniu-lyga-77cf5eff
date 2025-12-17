-- Add is_featured (show on main page) and is_recommended (show badge) columns to cars table
ALTER TABLE public.cars ADD COLUMN is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.cars ADD COLUMN is_recommended boolean NOT NULL DEFAULT false;