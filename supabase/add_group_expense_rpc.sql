-- Drop previous versions to fix "Ambigious Function" (PGRST203) error
DROP FUNCTION IF EXISTS add_group_expense(TEXT, NUMERIC, UUID, UUID, JSONB[]);
DROP FUNCTION IF EXISTS add_group_expense(TEXT, NUMERIC, TEXT, TEXT, JSONB[]);

-- Re-create the function cleanly
CREATE OR REPLACE FUNCTION add_group_expense(
  p_title TEXT,
  p_amount NUMERIC,
  p_paid_by TEXT, -- Uses TEXT to accept both UUID string and text input
  p_group_id TEXT, -- Uses TEXT to accept both UUID string and text input
  p_splits JSONB[] 
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_expense_id UUID;
  v_split JSONB;
BEGIN
  -- 1. Verify user is member of the group (Security Check)
  IF NOT EXISTS (
    SELECT 1 FROM groups 
    WHERE id = p_group_id::uuid 
    AND auth.uid() = ANY(member_ids)
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authorized');
  END IF;

  -- 2. Insert the main group expense record
  INSERT INTO group_expenses (title, amount, paid_by, group_id, split_between)
  VALUES (
    p_title, 
    p_amount, 
    p_paid_by::uuid, 
    p_group_id::uuid, 
    (SELECT array_agg((x->>'user_id')::uuid) FROM unnest(p_splits) as x)
  )
  RETURNING id INTO v_group_expense_id;

  -- 3. Insert individual transactions for each member
  INSERT INTO transactions (
    user_id, 
    amount, 
    category, 
    date, 
    merchant, 
    status, 
    type, 
    note, 
    group_id, 
    group_expense_id
  )
  SELECT 
    (x->>'user_id')::uuid,
    (x->>'amount')::numeric,
    x->>'category',
    (x->>'date')::timestamp,
    x->>'merchant',
    'completed', -- status
    x->>'type',
    x->>'note',
    p_group_id::uuid,
    v_group_expense_id
  FROM unnest(p_splits) as x;

  RETURN jsonb_build_object('success', true, 'id', v_group_expense_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
