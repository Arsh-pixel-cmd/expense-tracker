-- Drop previous versions to avoid conflicts
DROP FUNCTION IF EXISTS join_group_by_code(TEXT, UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS join_group_by_code(TEXT, TEXT, TEXT, TEXT);

-- Re-create the function cleanly
CREATE OR REPLACE FUNCTION join_group_by_code(
  p_invite_code TEXT,
  p_user_id TEXT, 
  p_user_name TEXT,
  p_user_avatar TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_id UUID;
  v_member_ids UUID[];
  v_members JSONB; -- FIXED: Changed from JSONB[] to JSONB (Database column type)
  v_group_name TEXT;
  v_user_uuid UUID;
BEGIN
  -- Cast user_id to UUID safely
  BEGIN
    v_user_uuid := p_user_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid User ID format');
  END;

  -- 1. Find group by code (Case insensitive)
  SELECT id, name, member_ids, members
  INTO v_group_id, v_group_name, v_member_ids, v_members
  FROM groups
  WHERE UPPER(invite_code) = UPPER(p_invite_code);

  -- 2. Validate
  IF v_group_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid invite code');
  END IF;

  -- Check if already a member
  IF v_user_uuid = ANY(v_member_ids) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Already a member');
  END IF;

  -- 3. Update members
  -- Append user ID to UUID array
  v_member_ids := array_append(v_member_ids, v_user_uuid);
  
  -- Handle members JSONB array
  -- If it's null or not an array, start with empty array
  IF v_members IS NULL OR jsonb_typeof(v_members) != 'array' THEN
    v_members := '[]'::jsonb;
  END IF;

  -- Append new member object to JSONB array using || operator
  v_members := v_members || jsonb_build_object(
    'uid', v_user_uuid,
    'displayName', p_user_name,
    'photoURL', p_user_avatar
  );

  -- 4. Save changes
  UPDATE groups
  SET member_ids = v_member_ids,
      members = v_members
  WHERE id = v_group_id;

  RETURN jsonb_build_object('success', true, 'group_name', v_group_name);
END;
$$;
