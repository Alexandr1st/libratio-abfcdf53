-- Sync stale club_name in profiles from clubs table
UPDATE public.profiles p
SET club_name = c.name
FROM public.clubs c
WHERE p.club_id = c.id
AND (p.club_name IS DISTINCT FROM c.name);