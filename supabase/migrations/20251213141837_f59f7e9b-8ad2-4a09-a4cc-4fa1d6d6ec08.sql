-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to update any car
CREATE POLICY "Admins can update any car" 
ON public.cars 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- Allow admins to delete any car
CREATE POLICY "Admins can delete any car" 
ON public.cars 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));