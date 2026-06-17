-- 1. Update the function to use MCCRMPR format and also assign codes to family members
CREATE OR REPLACE FUNCTION public.set_member_code()
RETURNS TRIGGER AS $$
DECLARE
  i int;
  fm jsonb;
  new_family_members jsonb;
BEGIN
  -- Handle main member code
  IF NEW.member_code IS NULL OR NEW.member_code NOT LIKE 'MCCRMPR%' THEN
    IF NEW.member_code LIKE 'M-%' THEN
      NEW.member_code := 'MCCRMPR' || substring(NEW.member_code from 3);
    ELSE
      NEW.member_code := 'MCCRMPR' || lpad(nextval('public.member_code_seq')::text, 3, '0');
    END IF;
  END IF;

  -- Handle family members codes
  IF NEW.family_members IS NOT NULL AND jsonb_typeof(NEW.family_members) = 'array' AND jsonb_array_length(NEW.family_members) > 0 THEN
    new_family_members := NEW.family_members;
    FOR i IN 0 .. jsonb_array_length(new_family_members) - 1 LOOP
      fm := new_family_members->i;
      IF NOT (fm ? 'member_code') OR fm->>'member_code' = '' OR fm->>'member_code' IS NULL THEN
        fm := jsonb_set(fm, '{member_code}', to_jsonb('MCCRMPR' || lpad(nextval('public.member_code_seq')::text, 3, '0')));
        new_family_members := jsonb_set(new_family_members, ARRAY[i::text], fm);
      END IF;
    END LOOP;
    NEW.family_members := new_family_members;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Update the trigger to run on UPDATE as well
DROP TRIGGER IF EXISTS trg_set_member_code ON public.members;
CREATE TRIGGER trg_set_member_code
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.set_member_code();

-- 3. Trigger an update on all existing members to assign new codes to main members and family members
-- This single UPDATE will fire the trigger we just created, migrating both the main member_code and family_members.
UPDATE public.members SET updated_at = now();
