-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  invoice_type TEXT NOT NULL DEFAULT 'commission',
  buyer_name TEXT NOT NULL,
  buyer_company_code TEXT NOT NULL,
  buyer_vat_code TEXT,
  buyer_address TEXT NOT NULL,
  buyer_is_company BOOLEAN NOT NULL DEFAULT true,
  items JSONB NOT NULL,
  total_amount NUMERIC NOT NULL,
  note TEXT,
  car_vin TEXT,
  car_plate TEXT,
  car_mileage INTEGER,
  car_notes TEXT,
  car_make TEXT,
  car_model TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
ON public.invoices FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON public.invoices FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_buyers table
CREATE TABLE public.saved_buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company_code TEXT NOT NULL,
  vat_code TEXT,
  address TEXT NOT NULL,
  is_company BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved buyers"
ON public.saved_buyers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved buyers"
ON public.saved_buyers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved buyers"
ON public.saved_buyers FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_products table
CREATE TABLE public.saved_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  default_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved products"
ON public.saved_products FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved products"
ON public.saved_products FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved products"
ON public.saved_products FOR DELETE
USING (auth.uid() = user_id);

-- Create saved_notes table
CREATE TABLE public.saved_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved notes"
ON public.saved_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved notes"
ON public.saved_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved notes"
ON public.saved_notes FOR DELETE
USING (auth.uid() = user_id);