-- 1. Create a sequence for member codes
CREATE SEQUENCE IF NOT EXISTS public.member_code_seq START 1;

-- 2. Add member_code column to members table
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS member_code text UNIQUE;

-- 3. Update existing members with a member code
UPDATE public.members 
SET member_code = 'M-' || lpad(nextval('public.member_code_seq')::text, 3, '0')
WHERE member_code IS NULL;

-- 4. Make member_code NOT NULL after updating existing rows
ALTER TABLE public.members ALTER COLUMN member_code SET NOT NULL;

-- 5. Create a function to auto-generate member_code for new members
CREATE OR REPLACE FUNCTION public.set_member_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_code IS NULL THEN
    NEW.member_code := 'M-' || lpad(nextval('public.member_code_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to run the function before insert
DROP TRIGGER IF EXISTS trg_set_member_code ON public.members;
CREATE TRIGGER trg_set_member_code
BEFORE INSERT ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.set_member_code();
