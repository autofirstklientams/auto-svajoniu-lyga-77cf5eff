-- Create inquiries table to store all loan/car inquiries
CREATE TABLE public.inquiries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    amount NUMERIC,
    loan_type TEXT,
    loan_period TEXT,
    source TEXT NOT NULL DEFAULT 'autokopers',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (no auth required for submissions)
CREATE POLICY "Allow public inserts" 
ON public.inquiries 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view inquiries" 
ON public.inquiries 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));