-- Add is_paid column to invoices table
ALTER TABLE public.invoices ADD COLUMN is_paid boolean NOT NULL DEFAULT false;

-- Create policy to allow users to update their own invoices
CREATE POLICY "Users can update their own invoices" 
ON public.invoices 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);