-- Fix RLS policy for company_books table to work with contact_person_id
DROP POLICY IF EXISTS "Company employees can manage books" ON public.company_books;

-- Create new policy that allows company contact persons to manage company books
CREATE POLICY "Company contact persons can manage books" 
ON public.company_books 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM public.companies 
    WHERE companies.id = company_books.company_id 
    AND companies.contact_person_id = auth.uid()
  )
);