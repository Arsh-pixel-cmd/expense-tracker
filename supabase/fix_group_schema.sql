-- Fix group_expenses schema to use UUIDs
ALTER TABLE group_expenses 
ALTER COLUMN group_id TYPE uuid USING group_id::text::uuid;

-- Ensure id is also a UUID (defaulting to gen_random_uuid())
ALTER TABLE group_expenses 
ALTER COLUMN id TYPE uuid USING id::text::uuid,
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure FK constraint exists and is correct
ALTER TABLE group_expenses
DROP CONSTRAINT IF EXISTS group_expenses_group_id_fkey,
ADD CONSTRAINT group_expenses_group_id_fkey 
    FOREIGN KEY (group_id) 
    REFERENCES groups(id) 
    ON DELETE CASCADE;

-- Ensure paid_by references auth.users (or profiles if you use that)
-- Usually paid_by is a UUID string from auth.uid()
ALTER TABLE group_expenses
ALTER COLUMN paid_by TYPE uuid USING paid_by::uuid;

-- Add RLS policy if missing (for safety)
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group expenses if they are members"
ON group_expenses FOR SELECT
USING (
    exists (
        select 1 from groups
        where groups.id = group_expenses.group_id
        and auth.uid() = any(groups.member_ids)
    )
);

CREATE POLICY "Users can insert group expenses if they are members"
ON group_expenses FOR INSERT
WITH CHECK (
    exists (
        select 1 from groups
        where groups.id = group_expenses.group_id
        and auth.uid() = any(groups.member_ids)
    )
);
