-- Fix security warnings by using security definer functions
-- First, create security definer functions to safely check access

-- Function to check if user can view profile based on company membership
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_company_id uuid;
  target_user_company_id uuid;
BEGIN
  -- Get the requesting user's company
  SELECT company_id INTO requesting_user_company_id
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Get the target user's company
  SELECT company_id INTO target_user_company_id
  FROM public.profiles 
  WHERE id = profile_user_id;
  
  -- Allow if same user
  IF auth.uid() = profile_user_id THEN
    RETURN true;
  END IF;
  
  -- Allow if both users are in the same company
  IF requesting_user_company_id IS NOT NULL 
     AND target_user_company_id IS NOT NULL 
     AND requesting_user_company_id = target_user_company_id THEN
    RETURN true;
  END IF;
  
  -- Allow if target user is a company contact person
  IF EXISTS (
    SELECT 1 FROM public.companies 
    WHERE contact_person_id = profile_user_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Drop the previous policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view company colleague profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view company contact persons" ON public.profiles;

-- Create a single, secure policy using the function
CREATE POLICY "Authorized profile access only" 
ON public.profiles 
FOR SELECT 
USING (public.can_view_profile(id));