
-- Backfill: add missing club_members rows for users who have club_id in profile but no club_members record
INSERT INTO public.club_members (club_id, user_id, is_admin)
SELECT p.club_id, p.id, false
FROM public.profiles p
WHERE p.club_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.club_members cm
  WHERE cm.club_id = p.club_id AND cm.user_id = p.id
);

-- Create trigger function to auto-sync profile club_id changes to club_members
CREATE OR REPLACE FUNCTION public.sync_club_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If club_id was removed, delete from club_members
  IF OLD.club_id IS NOT NULL AND (NEW.club_id IS NULL OR NEW.club_id != OLD.club_id) THEN
    DELETE FROM public.club_members
    WHERE user_id = NEW.id AND club_id = OLD.club_id;
  END IF;

  -- If club_id was added or changed, ensure membership exists
  IF NEW.club_id IS NOT NULL AND (OLD.club_id IS NULL OR NEW.club_id != OLD.club_id) THEN
    INSERT INTO public.club_members (club_id, user_id, is_admin)
    VALUES (NEW.club_id, NEW.id, false)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles
CREATE TRIGGER sync_club_membership_trigger
AFTER UPDATE OF club_id ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_club_membership();
