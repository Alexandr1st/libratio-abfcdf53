-- Fix critical security issue: Restrict profile access to authenticated users only
-- Currently profiles are accessible to unauthenticated users which is a security risk

-- Drop existing policies
DROP POLICY IF EXISTS "Secure profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new restrictive policies that only allow authenticated users
CREATE POLICY "Authenticated users can view profiles based on access rules"
ON public.profiles
FOR SELECT
TO authenticated
USING (can_view_profile(id));

CREATE POLICY "Authenticated users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Also fix company_employees table to be more secure
DROP POLICY IF EXISTS "Anyone can view company employees" ON public.company_employees;

-- Replace with policy that only allows authenticated users to view employees within access rules
CREATE POLICY "Authenticated users can view company employees"
ON public.company_employees
FOR SELECT
TO authenticated
USING (
  -- Users can view employees of their own company
  EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() 
    AND p2.id = company_employees.user_id
    AND p1.company_id = p2.company_id
    AND p1.company_id IS NOT NULL
  )
  OR
  -- Or if the user is viewing their own employment record
  user_id = auth.uid()
);