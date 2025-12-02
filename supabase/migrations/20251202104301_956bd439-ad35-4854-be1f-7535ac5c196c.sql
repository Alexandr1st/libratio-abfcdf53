-- Переименование таблиц
ALTER TABLE public.companies RENAME TO clubs;
ALTER TABLE public.company_employees RENAME TO club_members;
ALTER TABLE public.company_books RENAME TO club_books;

-- Переименование колонок company_id в club_id
ALTER TABLE public.profiles RENAME COLUMN company_id TO club_id;
ALTER TABLE public.club_members RENAME COLUMN company_id TO club_id;
ALTER TABLE public.club_books RENAME COLUMN company_id TO club_id;

-- Переименование колонки company в profiles (если есть)
ALTER TABLE public.profiles RENAME COLUMN company TO club_name;

-- Обновление RLS политик для clubs (бывшая companies)
DROP POLICY IF EXISTS "Anyone can view companies" ON public.clubs;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.clubs;
DROP POLICY IF EXISTS "Company admins can update companies" ON public.clubs;

CREATE POLICY "Anyone can view clubs" 
ON public.clubs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create clubs" 
ON public.clubs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Club admins can update clubs" 
ON public.clubs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.club_members
  WHERE club_members.club_id = clubs.id 
  AND club_members.user_id = auth.uid() 
  AND club_members.is_admin = true
));

-- Обновление RLS политик для club_members (бывшая company_employees)
DROP POLICY IF EXISTS "Users can join companies" ON public.club_members;
DROP POLICY IF EXISTS "Company admins can manage employees" ON public.club_members;
DROP POLICY IF EXISTS "Authenticated users can view company employees" ON public.club_members;

CREATE POLICY "Users can join clubs" 
ON public.club_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Club admins can manage members" 
ON public.club_members 
FOR ALL 
USING (
  (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
    AND profiles.club_id = club_members.club_id
  )) OR (user_id = auth.uid())
);

CREATE POLICY "Authenticated users can view club members" 
ON public.club_members 
FOR SELECT 
USING (
  (EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = auth.uid() 
    AND p2.id = club_members.user_id 
    AND p1.club_id = p2.club_id 
    AND p1.club_id IS NOT NULL
  )) OR (user_id = auth.uid())
);

-- Обновление RLS политик для club_books (бывшая company_books)
DROP POLICY IF EXISTS "Anyone can view company books" ON public.club_books;
DROP POLICY IF EXISTS "Company contact persons can manage books" ON public.club_books;

CREATE POLICY "Anyone can view club books" 
ON public.club_books 
FOR SELECT 
USING (true);

CREATE POLICY "Club contact persons can manage books" 
ON public.club_books 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.clubs
  WHERE clubs.id = club_books.club_id 
  AND clubs.contact_person_id = auth.uid()
));

-- Обновление функции can_view_profile
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  requesting_user_club_id uuid;
  target_user_club_id uuid;
BEGIN
  -- Allow if user is super admin
  IF public.is_super_admin(auth.uid()) THEN
    RETURN true;
  END IF;

  -- Get the requesting user's club
  SELECT club_id INTO requesting_user_club_id
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Get the target user's club
  SELECT club_id INTO target_user_club_id
  FROM public.profiles 
  WHERE id = profile_user_id;
  
  -- Allow if same user
  IF auth.uid() = profile_user_id THEN
    RETURN true;
  END IF;
  
  -- Allow if both users are in the same club
  IF requesting_user_club_id IS NOT NULL 
     AND target_user_club_id IS NOT NULL 
     AND requesting_user_club_id = target_user_club_id THEN
    RETURN true;
  END IF;
  
  -- Allow if target user is a club contact person
  IF EXISTS (
    SELECT 1 FROM public.clubs 
    WHERE contact_person_id = profile_user_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;