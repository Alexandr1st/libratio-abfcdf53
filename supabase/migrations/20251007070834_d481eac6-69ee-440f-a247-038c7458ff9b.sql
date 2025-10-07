-- Update can_view_profile function to allow super admins to view all profiles
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requesting_user_company_id uuid;
  target_user_company_id uuid;
BEGIN
  -- Allow if user is super admin
  IF public.is_super_admin(auth.uid()) THEN
    RETURN true;
  END IF;

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
$function$;