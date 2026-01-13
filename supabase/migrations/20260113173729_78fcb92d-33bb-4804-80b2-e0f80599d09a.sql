-- Add foreign key relationship between invoices.user_id and profiles.id
ALTER TABLE public.invoices 
ADD CONSTRAINT invoices_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;