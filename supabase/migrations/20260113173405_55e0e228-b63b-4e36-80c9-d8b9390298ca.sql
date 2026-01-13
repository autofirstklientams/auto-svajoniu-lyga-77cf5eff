-- Add RLS policy for admins to view all invoices
CREATE POLICY "Admins can view all invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to delete any invoice
CREATE POLICY "Admins can delete any invoice" 
ON public.invoices 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to update any invoice
CREATE POLICY "Admins can update any invoice" 
ON public.invoices 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));