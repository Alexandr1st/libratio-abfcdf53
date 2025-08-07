-- Create Yandex company for the user
INSERT INTO companies (name, description, industry, location)
VALUES ('Яндекс', 'Российская транснациональная компания в сфере интернет-услуг', 'Технологии', 'Москва, Россия');

-- Get the company ID and update user profile
WITH new_company AS (
  SELECT id FROM companies WHERE name = 'Яндекс' ORDER BY created_at DESC LIMIT 1
)
UPDATE profiles 
SET company_id = (SELECT id FROM new_company)
WHERE id = '4ca49c08-0c20-4907-8705-52fa1bdb3148';

-- Add user as admin to the company
WITH new_company AS (
  SELECT id FROM companies WHERE name = 'Яндекс' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO company_employees (company_id, user_id, is_admin, position)
VALUES (
  (SELECT id FROM new_company), 
  '4ca49c08-0c20-4907-8705-52fa1bdb3148', 
  true,
  'Администратор'
);