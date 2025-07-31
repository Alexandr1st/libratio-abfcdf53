-- Fix the recursive RLS policy for company_employees
DROP POLICY IF EXISTS "Company admins can manage employees" ON company_employees;

-- Create a simpler policy for managing employees
CREATE POLICY "Company admins can manage employees" 
ON company_employees 
FOR ALL 
USING (
  company_id IN (
    SELECT company_id 
    FROM company_employees 
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Update the policy to avoid recursion by using a different approach
DROP POLICY IF EXISTS "Company admins can manage employees" ON company_employees;

CREATE POLICY "Company admins can manage employees" 
ON company_employees 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = company_employees.company_id
  ) 
  OR 
  user_id = auth.uid()
);