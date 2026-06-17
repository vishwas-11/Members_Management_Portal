-- =============================================================================
-- Migration: Duplicate Profile Prevention Functions
-- Adds secure Postgres functions for claim-profile and duplicate-detection flows
-- =============================================================================

-- 1. Function to find a member by member_code and verify Aadhaar last 4 digits
-- Searches both the members table (head) and family_members JSONB arrays
-- Returns: match_type ('head' | 'family'), parent_member_id, matched data
CREATE OR REPLACE FUNCTION public.find_member_by_code_and_aadhaar(
  p_code text,
  p_aadhaar_last4 text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_member record;
  v_fm jsonb;
  v_idx int;
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check 1: Direct match on members table (family head)
  SELECT id, user_id, full_name, aadhaar_number, member_code, age, phone, dob,
         marital_status, address, avatar_url, certificate_url
  INTO v_member
  FROM public.members
  WHERE member_code = p_code;

  IF FOUND THEN
    -- Verify Aadhaar last 4
    IF right(v_member.aadhaar_number, 4) = p_aadhaar_last4 THEN
      -- Check if already linked to an auth user
      IF v_member.user_id IS NOT NULL THEN
        v_result := jsonb_build_object(
          'match_type', 'head_already_linked',
          'member_code', v_member.member_code,
          'name', v_member.full_name
        );
      ELSE
        v_result := jsonb_build_object(
          'match_type', 'head',
          'member_id', v_member.id,
          'member_code', v_member.member_code,
          'name', v_member.full_name,
          'aadhaar_masked', 'XXXX XXXX ' || right(v_member.aadhaar_number, 4)
        );
      END IF;
      RETURN v_result;
    ELSE
      RETURN jsonb_build_object('error', 'aadhaar_mismatch');
    END IF;
  END IF;

  -- Check 2: Search family_members JSONB across all members
  FOR v_member IN
    SELECT id, family_members
    FROM public.members
    WHERE family_members IS NOT NULL
      AND jsonb_typeof(family_members) = 'array'
      AND jsonb_array_length(family_members) > 0
  LOOP
    FOR v_idx IN 0 .. jsonb_array_length(v_member.family_members) - 1 LOOP
      v_fm := v_member.family_members->v_idx;
      IF v_fm->>'member_code' = p_code THEN
        -- Check if already claimed
        IF (v_fm->>'claimed')::boolean IS TRUE THEN
          RETURN jsonb_build_object(
            'error', 'already_claimed',
            'name', v_fm->>'name'
          );
        END IF;
        -- Verify Aadhaar last 4
        IF right(v_fm->>'aadhaar_number', 4) = p_aadhaar_last4 THEN
          v_result := jsonb_build_object(
            'match_type', 'family',
            'parent_member_id', v_member.id,
            'family_index', v_idx,
            'member_code', v_fm->>'member_code',
            'name', v_fm->>'name',
            'age', (v_fm->>'age')::int,
            'phone', v_fm->>'phone',
            'dob', v_fm->>'dob',
            'marital_status', v_fm->>'marital_status',
            'aadhaar_number', v_fm->>'aadhaar_number',
            'avatar_url', v_fm->>'avatar_url',
            'certificate_url', v_fm->>'certificate_url',
            'relationship', v_fm->>'relationship',
            'aadhaar_masked', 'XXXX XXXX ' || right(v_fm->>'aadhaar_number', 4)
          );
          RETURN v_result;
        ELSE
          RETURN jsonb_build_object('error', 'aadhaar_mismatch');
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- No match found
  RETURN jsonb_build_object('error', 'not_found');
END;
$$;


-- 2. Function to check for duplicate members by name + Aadhaar
-- Used during new registration to warn about potential duplicates
CREATE OR REPLACE FUNCTION public.check_duplicate_member(
  p_name text,
  p_aadhaar text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_duplicates jsonb := '[]'::jsonb;
  v_member record;
  v_fm jsonb;
  v_idx int;
  v_name_lower text := lower(trim(p_name));
  v_aadhaar_last4 text := right(p_aadhaar, 4);
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check members table (family heads)
  FOR v_member IN
    SELECT id, full_name, member_code, aadhaar_number, avatar_url
    FROM public.members
    WHERE aadhaar_number = p_aadhaar
       OR (lower(trim(full_name)) = v_name_lower AND right(aadhaar_number, 4) = v_aadhaar_last4)
  LOOP
    v_duplicates := v_duplicates || jsonb_build_object(
      'match_type', 'head',
      'member_code', v_member.member_code,
      'name', v_member.full_name,
      'aadhaar_masked', 'XXXX XXXX ' || right(v_member.aadhaar_number, 4),
      'avatar_url', v_member.avatar_url
    );
  END LOOP;

  -- Check family_members JSONB
  FOR v_member IN
    SELECT id, family_members
    FROM public.members
    WHERE family_members IS NOT NULL
      AND jsonb_typeof(family_members) = 'array'
      AND jsonb_array_length(family_members) > 0
  LOOP
    FOR v_idx IN 0 .. jsonb_array_length(v_member.family_members) - 1 LOOP
      v_fm := v_member.family_members->v_idx;

      IF (v_fm->>'claimed')::boolean IS NOT TRUE THEN
        IF v_fm->>'aadhaar_number' = p_aadhaar
           OR (lower(trim(v_fm->>'name')) = v_name_lower AND right(v_fm->>'aadhaar_number', 4) = v_aadhaar_last4) THEN
          v_duplicates := v_duplicates || jsonb_build_object(
            'match_type', 'family',
            'member_code', v_fm->>'member_code',
            'name', v_fm->>'name',
            'relationship', v_fm->>'relationship',
            'aadhaar_masked', 'XXXX XXXX ' || right(v_fm->>'aadhaar_number', 4),
            'avatar_url', v_fm->>'avatar_url'
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('duplicates', v_duplicates);
END;
$$;


-- 3. Secure: revoke default public EXECUTE and grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.find_member_by_code_and_aadhaar(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_member_by_code_and_aadhaar(text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_duplicate_member(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_duplicate_member(text, text) TO authenticated;
