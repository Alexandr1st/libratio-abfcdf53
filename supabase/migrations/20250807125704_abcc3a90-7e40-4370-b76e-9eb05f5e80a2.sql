-- Add contact person field to companies table
ALTER TABLE companies ADD COLUMN contact_person_id UUID REFERENCES profiles(id);

-- Update Yandex company to set Иван Петров as contact person, not employee
UPDATE companies 
SET contact_person_id = '4ca49c08-0c20-4907-8705-52fa1bdb3148'
WHERE name = 'Яндекс';

-- Remove Иван Петров from company employees (he's contact person, not employee)
DELETE FROM company_employees 
WHERE user_id = '4ca49c08-0c20-4907-8705-52fa1bdb3148' 
AND company_id = 'a21bcc7b-c600-40f5-82f6-591f2fe4b233';

-- Clear company_id from user profile (user is not employee, just contact person)
UPDATE profiles 
SET company_id = NULL 
WHERE id = '4ca49c08-0c20-4907-8705-52fa1bdb3148';