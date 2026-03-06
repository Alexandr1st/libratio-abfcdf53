
-- Fix profiles: set correct club_id for Иван and Тестовый to Беградский
UPDATE profiles SET club_id = '1e62b704-6e84-48c0-8c34-496fbb490ae1', club_name = 'Беградский' 
WHERE id IN ('4ca49c08-0c20-4907-8705-52fa1bdb3148', '99b988c5-8799-42bf-b99b-4770b23270eb');

-- Clear club for Александр Зайцев (no club_members entry)
UPDATE profiles SET club_id = NULL, club_name = NULL WHERE id = 'b353b6b1-4435-49f3-9957-c68718300af5';

-- Fix club_members: update entries from Беградский to match profiles (they're already correct in club_members)
-- club_members already has both users in Беградский, which is correct

-- Remove contact_person_id from Яндекс since Иван is in Беградский
UPDATE clubs SET contact_person_id = NULL WHERE id = 'a21bcc7b-c600-40f5-82f6-591f2fe4b233';
