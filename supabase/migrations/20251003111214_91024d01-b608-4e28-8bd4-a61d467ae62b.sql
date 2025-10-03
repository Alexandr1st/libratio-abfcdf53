-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Super admins can manage all admin roles" ON admin_roles;

-- Create security definer function to check super admin status
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin'
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Super admins can view all admin roles"
ON admin_roles
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert admin roles"
ON admin_roles
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update admin roles"
ON admin_roles
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete admin roles"
ON admin_roles
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));