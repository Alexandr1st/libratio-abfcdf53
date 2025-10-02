-- Назначаем Ивана Петрова суперадминистратором
INSERT INTO admin_roles (user_id, role) 
VALUES ('4ca49c08-0c20-4907-8705-52fa1bdb3148', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;