-- 1. Drop IDENTITY property if it exists (fix for "identity column type" error)
ALTER TABLE group_expenses ALTER COLUMN id DROP IDENTITY IF EXISTS;

-- 2. Convert ID to UUID
ALTER TABLE group_expenses 
ALTER COLUMN id TYPE uuid USING (
  CASE 
    WHEN id::text ~ '^[0-9a-fA-F-]{36}$' THEN id::text::uuid  -- Already UUID format
    ELSE gen_random_uuid() -- Generate new if numeric/invalid
  END
);
ALTER TABLE group_expenses ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Convert group_id to UUID
ALTER TABLE group_expenses 
ALTER COLUMN group_id TYPE uuid USING group_id::text::uuid;

-- 4. Convert paid_by to UUID
ALTER TABLE group_expenses
ALTER COLUMN paid_by TYPE uuid USING paid_by::uuid;

-- 5. Fix Foreign Key
ALTER TABLE group_expenses
DROP CONSTRAINT IF EXISTS group_expenses_group_id_fkey,
ADD CONSTRAINT group_expenses_group_id_fkey 
    FOREIGN KEY (group_id) 
    REFERENCES groups(id) 
    ON DELETE CASCADE;

-- 6. Add RLS Policies (Safely drop first to avoid "policy already exists" error)
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view group expenses if they are members" ON group_expenses;
CREATE POLICY "Users can view group expenses if they are members"
ON group_expenses FOR SELECT
USING (
    exists (
        select 1 from groups
        where groups.id = group_expenses.group_id
        and auth.uid() = any(groups.member_ids)
    )
);

DROP POLICY IF EXISTS "Users can insert group expenses if they are members" ON group_expenses;
CREATE POLICY "Users can insert group expenses if they are members"
ON group_expenses FOR INSERT
WITH CHECK (
    exists (
        select 1 from groups
        where groups.id = group_expenses.group_id
        and auth.uid() = any(groups.member_ids)
    )
);
