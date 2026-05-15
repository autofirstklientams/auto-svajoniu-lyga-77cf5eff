
-- Storage UPDATE policy for invoices bucket
CREATE POLICY "Users can update their own invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'invoices' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'invoices' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- saved_products UPDATE policy
CREATE POLICY "Users can update their own saved products"
ON public.saved_products
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Super admin deletion protection
CREATE OR REPLACE FUNCTION public.prevent_super_admin_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.id = '02984778-7f5d-4547-9581-f3f81d8c87e0'::uuid OR
     (TG_TABLE_NAME = 'user_roles' AND OLD.user_id = '02984778-7f5d-4547-9581-f3f81d8c87e0'::uuid) THEN
    RAISE EXCEPTION 'Cannot delete super admin';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS block_super_admin_profile_delete ON public.profiles;
CREATE TRIGGER block_super_admin_profile_delete
  BEFORE DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_deletion();

DROP TRIGGER IF EXISTS block_super_admin_role_delete ON public.user_roles;
CREATE TRIGGER block_super_admin_role_delete
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_super_admin_deletion();
