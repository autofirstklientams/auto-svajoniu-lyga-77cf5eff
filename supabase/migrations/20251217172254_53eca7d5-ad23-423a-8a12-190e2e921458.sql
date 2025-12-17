-- Add margin scheme column to invoices table
ALTER TABLE public.invoices 
ADD COLUMN is_margin_scheme boolean NOT NULL DEFAULT false;