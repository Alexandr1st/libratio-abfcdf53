-- Fix security issue: Restrict profile access to authorized users only
-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can view profiles of people in their company
CREATE POLICY "Users can view company colleague profiles" 
ON public.profiles 
FOR SELECT 
USING (
  company_id IS NOT NULL 
  AND company_id IN (
    SELECT company_id 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND company_id IS NOT NULL
  )
);

-- Policy 3: Anyone can view company contact person profiles (needed for company details)
CREATE POLICY "Anyone can view company contact persons" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT contact_person_id 
    FROM public.companies 
    WHERE contact_person_id IS NOT NULL
  )
);