-- 1. Create cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_duplicate_categories()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT name, MIN(id) as keep_id, COUNT(*) 
        FROM categories 
        GROUP BY name 
        HAVING COUNT(*) > 1 
    LOOP
        -- Reassign transactions from duplicate categories to the kept one
        UPDATE transactions 
        SET category = r.name 
        WHERE category IN (SELECT name FROM categories WHERE name = r.name AND id != r.keep_id);

        -- Delete the duplicates
        DELETE FROM categories 
        WHERE name = r.name AND id != r.keep_id;
    END LOOP;
END;
$$;


-- 2. Drop ambiguous functions if they exist
DROP FUNCTION IF EXISTS public.delete_category_and_reassign_transactions(integer);
DROP FUNCTION IF EXISTS public.delete_category_and_reassign_transactions(uuid);

-- 3. Create a clean, typed delete function
CREATE OR REPLACE FUNCTION public.delete_category_by_id(category_id_to_delete integer)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    others_id integer;
BEGIN
    -- Find the 'Others' category ID for this user
    SELECT id INTO others_id
    FROM categories
    WHERE user_id = (SELECT user_id FROM categories WHERE id = category_id_to_delete)
    AND name = 'Others'
    LIMIT 1;

    -- If 'Others' doesn't exist (shouldn't happen), assume it's a general bucket or create one, 
    -- but for safety we'll just set it to NULL or handle gracefully. 
    -- For now, let's update by NAME since transaction category column is a STRING in this schema.
    
    UPDATE transactions
    SET category = 'Others'
    WHERE category = (SELECT name FROM categories WHERE id = category_id_to_delete);

    -- Delete the category
    DELETE FROM categories WHERE id = category_id_to_delete;
END;
$$;
